import { observer } from "mobx-react-lite";
import React, { Fragment, useContext } from "react";
import { Link } from "react-router-dom";
import { Item, Button, Label, Segment } from "semantic-ui-react";
import ActivityStore from "../../../app/stores/activityStore";
import ActivitiyListItem from "./ActivitiyListItem";

const ActivityList: React.FC = () => {
  const activityStore = useContext(ActivityStore);
  const {
    activitiesByDate,
    deleteActivity,
    submitting,
    target,
  } = activityStore;
  return (
    <Fragment>
      {activitiesByDate.map(([group, activities]) => (
        <Fragment key={group}>
          <Label size='large' color='blue'>
            {group}
          </Label>
          <Item.Group divided>
            {activities.map((activity) => (
              <ActivitiyListItem key={activity.id} activity={activity} />
            ))}
          </Item.Group>
        </Fragment>
      ))}
    </Fragment>
  );
};

export default observer(ActivityList);
// export default ActivityList;
