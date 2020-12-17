import { observable, action, makeObservable, computed, runInAction } from "mobx";
import { SyntheticEvent } from "react";
import agent from "../api/agent";
import { IActivity } from "../models/activity";
import {history} from "../..";
import { toast } from "react-toastify";
import { RootStore } from "./rootStore";
import { createAtendee, setActivityProps } from "../common/util/util";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";



export default class ActivityStore{
  rootStore: RootStore;

    constructor(rootStore: RootStore){
      makeObservable(this);
      this.rootStore = rootStore;
    }

    @observable activityRegistry = new Map();

    @observable activity: IActivity | null = null;
    @observable loadingInitial = false;
    @observable submitting = false;
    @observable target = "";
    @observable loading = false;

    //Za signalR
    @observable.ref hubConnection: HubConnection | null = null;

    @action createHubConnection =  (activityId: string) => {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl('http://localhost:5000/chat', {
          accessTokenFactory: () => this.rootStore.commonStore.token!
        })
        .configureLogging(LogLevel.Information)
        .build();
  
      this.hubConnection
        .start()
        .then(() => console.log(this.hubConnection!.state))
        .then(() => {
          console.log('Attempting to join group');
          this.hubConnection!.invoke('AddToGroup', activityId)
        })
        .catch(error => console.log('Error establishing connection: ', error));
  
      this.hubConnection.on('ReceiveComment', comment => {
        runInAction(() => {
          this.activity!.comments.push(comment)
        })
      })
  
      this.hubConnection.on('Send', message => {
        toast.info(message);
      })
    };
  
    @action stopHubConnection = () => {
      this.hubConnection!.invoke('RemoveFromGroup', this.activity!.id)
        .then(() => {
          this.hubConnection!.stop()
        })
        .then(() => console.log('Connection stopped'))
        .catch(err => console.log(err))
    }
  
    @action addComment = async (values: any) => {
      values.activityId = this.activity!.id;
      try {
        await this.hubConnection!.invoke('SendComment', values)
      } catch (error) {
        console.log(error);
      }
    }

    @computed get activitiesByDate(){
      return this.groupActivitiesByDate(Array.from(this.activityRegistry.values()));
    }
    groupActivitiesByDate(activities: IActivity[]){
      const sorted = activities.slice().sort((a,b)=>a.date.getTime() - b.date.getTime());
      return Object.entries(sorted.reduce((activities, activity) => {
        const date = activity.date!.toISOString().split("T")[0];
        activities[date] = activities[date] ? [...activities[date], activity] : [activity];
        return activities;
      }, {} as {[key:string] : IActivity[]}))
    }

    @action loadActivities = async () => {
        this.loadingInitial = true;
        // const user = this.rootStore.userStore.user!;
        try{
          const activities = await agent.Activities.list();
          runInAction(()=>{
            activities.forEach((a) => {
              setActivityProps(a, this.rootStore.userStore.user!);
              this.activityRegistry.set(a.id, a);
            });
            this.loadingInitial = false
          })
         
        }catch(error){
          runInAction(()=>{
            this.loadingInitial = false
          })
          console.log(error);
          
        }
       
    }

    @action selectActivity = (id: string) => {
      // this.selectedActivity = this.activities.find(a => a.id == id);
      this.activity = this.activityRegistry.get(id);
    }

    @action createActivity = async (activity: IActivity) => {
      this.submitting = true;
      try{
        await agent.Activities.create(activity);
        //Kreiranje u frontentu da ej korisnik host
        const atendee = createAtendee(this.rootStore.userStore.user!);
        atendee.isHost = true;
        let atendees = [];
        atendees.push(atendee);
        activity.attendees = atendees;
        activity.comments = [];
        activity.isHost = true;
        runInAction(()=>{
          //jedino observablesi moraju da budu u runInAction
          this.activityRegistry.set(activity.id, activity);
          this.submitting = false;
        });
        history.push(`/activities/${activity.id}`)
      }catch(error){
        runInAction(()=>{this.submitting = false;})
        //Inače baci error 400
        toast.error("Problem submiting data");
        console.log(error);
      }
    }

    @action loadActivity = async (id: string) =>{
      let activity = this.getActivity(id);
      // const user = this.rootStore.userStore.user!;
      if(activity){
        this.activity = activity;
        console.log(this.activity);
        return activity;
      }
      else{
        this.loadingInitial = true;
        try{
          activity = await agent.Activities.details(id);
          runInAction(()=>{
            setActivityProps(activity, this.rootStore.userStore.user!);
            this.activity = activity;
            this.activityRegistry.set(activity.id, activity);
            this.loadingInitial = false;
          })
          return activity;
        }
        catch(err){
          runInAction(()=>{this.loadingInitial = false;})
          console.log(err);
        }
      }

    }

    getActivity = (id: string)=>{
      return this.activityRegistry.get(id);
    }


    @action editActivity = async (activity: IActivity) => {
      this.submitting = true;
      try{
        await agent.Activities.update(activity);
       runInAction(()=>{
        this.activityRegistry.set(activity.id, activity);
        this.activity = activity;
        this.submitting = false;
       });
       history.push(`/activities/${activity.id}`)
      }
      catch(err){
        runInAction(()=>{
          this.submitting = false;
        })
        console.log(err);
      }
    }

    @action clearAtivity=()=>{
      this.activity = null;
    }

    @action cancelSelectedActivity=()=>{
      this.activity = null;
    }

    @action deleteActivity = async (event: SyntheticEvent<HTMLButtonElement>,id: string ) => {
      this.submitting = true;
      this.target = event.currentTarget.name;
      try{
        await agent.Activities.delete(id);
       runInAction(()=>{
        this.activityRegistry.delete(id);
        this.submitting = false;
        this.target = "";
       })
      }
      catch(err){
      runInAction(()=>{
        this.submitting = false;
        this.target = "";
      })
        console.log(err);
      }
    }

    @action attendActivity = async () =>{
      const atendee = createAtendee(this.rootStore.userStore.user!);
      this.loading = true;
      try{
        await agent.Activities.attend(this.activity!.id);
        runInAction(() => {
          if(this.activity){
            this.activity.attendees.push(atendee);
            this.activity.isGoing = true;
            this.activityRegistry.set(this.activity.id, this.activity);
            this.loading = false;
          }
        })
      }
      catch(err){
       runInAction(() => {
        this.loading = false;
       })
        toast.error("Proble signin up to activity");
      }     
    }

    @action cancelAttendence = async () => {
      this.loading = true;
      try{
        //Trazimo aktivnost preko ID
        await agent.Activities.unattend(this.activity!.id);
        runInAction(() => {
          if(this.activity){
            //Brisemo iz statea korisnika, filter vraca uvijek novi niz
            this.activity.attendees = this.activity.attendees.filter(
              c => c.username !== this.rootStore.userStore.user!.username
            );
            this.activity.isGoing = false;
            this.activityRegistry.set(this.activity.id, this.activity);
            this.loading = false;
          }
        })
      }
      catch(err){
        runInAction(() => {
          this.loading = false;
        })
        toast.error("Problem canceling attendence");
      }
     
    }
}

