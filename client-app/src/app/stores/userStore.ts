import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { history } from "../..";
import agent from "../api/agent";
import { IUser, IUserFormValues } from "../models/user";
import { RootStore } from "./rootStore";

export default class UserStore{
    rootStore: RootStore;

    constructor(rootStore: RootStore){
      makeObservable(this);
      this.rootStore = rootStore;
    }

    
    @observable user: IUser | null = null;

    @computed get isLoggedIn(){return !!this.user}

    @action login = async (values: IUserFormValues) => {
        try{
            const user = await agent.User.login(values);
            //kad se koristi await async treba dodat ovaj ruinaction, jer se gleda kao svaki novi poziv bla bla 
            runInAction(() => {
                this.user = user;
            })
           this.rootStore.commonStore.setToken(user.token);
            // console.log(user);
            this.rootStore.modalStore.closeModal();
            history.push("/activities");
        }
        catch(err){
           throw err;
        }
    }

    @action register = async (values: IUserFormValues) => {
        try{
            const user = await agent.User.register(values);
            this.rootStore.commonStore.setToken(user.token);
            this.rootStore.modalStore.closeModal();
            history.push("/activities");
        }
        catch(err){
            throw err;
        }
    }

    //Brisanje tokena iz localstorega nakon logouta sa sistema
    @action logout = () => {
        this.rootStore.commonStore.setToken(null);
        this.user = null;
        history.push("/");
    }

    @action getUser = async () => {
        try{
            const user = await agent.User.current();
            runInAction(() => 
            {
                this.user = user;
            })
        }
        catch(err){
            console.log(err);
        }
    }
}