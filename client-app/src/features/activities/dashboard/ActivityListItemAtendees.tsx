import React from "react";
import { List, Image, Popup } from "semantic-ui-react";
import { IAtendee } from "../../../app/models/activity";

interface IProps {
  attendees: IAtendee[];
}

export const ActivityListItemAtendees: React.FC<IProps> = ({ attendees }) => {
  return (
    <List horizontal>
      {attendees.map((a) => (
        <List.Item key={a.username}>
          <Popup
            header={a.displayName}
            trigger={
              <Image size='mini' circular src={a.image || "/assets/user.png"} />
            }
          />
        </List.Item>
      ))}
    </List>
  );
};
