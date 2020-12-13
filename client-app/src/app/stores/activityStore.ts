import { observable, action, makeObservable, computed, runInAction } from "mobx";
import { SyntheticEvent } from "react";
import agent from "../api/agent";
import { IActivity } from "../models/activity";
import {history} from "../..";
import { toast } from "react-toastify";
import { RootStore } from "./rootStore";



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
        try{
          const activities = await  agent.Activities.list();
          runInAction(()=>{
            activities.forEach((a) => {
              a.date = new Date(a.date);
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
        runInAction(()=>{
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
      if(activity){
        this.activity = activity;
        return activity;
      }
      else{
        this.loadingInitial = true;
        try{
          activity = await agent.Activities.details(id);
          runInAction(()=>{
            activity.date = new Date(activity.date);
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
}

