import { IActivity, IAtendee } from "../../models/activity";
import { IUser } from "../../models/user";

export const combineDateAndTime = (date: Date, time: Date) => {
    const timeString = time.getHours()+":"+time.getMinutes() + ":00";

    const year = date.getFullYear();
    const month = date.getMonth()+1;
    const day = date.getDate();
    const dateString = `${year}-${month}-${day}`;

    return new Date(dateString + " " + timeString);
}



export const setActivityProps = (a: IActivity, user: IUser) =>
{
    //Postavlja da li logovani user ide na aktivnost te da li je on kreirao
    a.date = new Date(a.date);
    a.isGoing = a.attendees.some(
      c => c.username === user.username
    )
    a.isHost = a.attendees.some(
      c => c.username === user.username && c.isHost
    )

    return a;
}


export const createAtendee = (user: IUser):IAtendee => {
  return {
    displayName: user.displayName,
    isHost: false,
    username: user.username,
    image: user.image!
  }
}