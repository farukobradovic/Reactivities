export interface IActivitesEnvelope{
    activities: IActivity[];
    activityCount: number;
}

export interface IActivity
{
    id: string;
    title: string;
    description: string;
    category: string;
    date: Date;
    city: string;
    venue: string;
    isGoing: boolean;
    isHost: boolean;
    attendees: IAtendee[];
    comments: IComment[];
}

export interface IComment{
    id: string;
    createdAt: Date;
    body: string;
    username: string;
    displayName: string;
    image: string;
}

//Sve su opcionalne sad
export interface IActivityFormValues extends Partial<IActivity>{
    time?: Date
}


export class ActivityFormValues implements IActivityFormValues{
    id?: string = undefined;
    title: string = "";
    category: string = "";
    description:string="";
    date?: Date = undefined;
    time?: Date = undefined;
    city: string="";
    venue: string="";

    constructor(init?: IActivityFormValues){
        if(init && init.date){
            init.time = init.date;
        }
        Object.assign(this, init);
    }
}

export interface IAtendee{
    username: string;
    displayName: string;
    image: string;
    isHost: boolean;
    following?: boolean;
}


//treba bit u profiles al aj
export interface IUserActivity{
    id: string;
    title: string;
    category: string;
    date: Date;
}