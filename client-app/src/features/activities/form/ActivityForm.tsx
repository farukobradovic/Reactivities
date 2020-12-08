import React, { useState, FormEvent, useContext, useEffect } from "react";
import { Button, Form, Grid, Segment } from "semantic-ui-react";
import { IActivity } from "../../../app/models/activity";
import { v4 as uuid } from "uuid";
import ActivityStore from "../../../app/stores/activityStore";
import { observer } from "mobx-react-lite";
import { RouteComponentProps } from "react-router-dom";
import { Form as FinalForm, Field } from "react-final-form";

interface DetailParams {
  id: string;
}

const ActivityForm: React.FC<RouteComponentProps<DetailParams>> = ({
  match,
  history,
}) => {
  const activityStore = useContext(ActivityStore);
  const {
    createActivity,
    editActivity,
    submitting,
    activity: initialFormState,
    loadActivity,
    clearAtivity,
  } = activityStore;

  const initializeForm = () => {
    if (initialFormState) {
      return initialFormState;
    } else {
      return {
        id: "",
        title: "",
        category: "",
        description: "",
        date: "",
        city: "",
        venue: "",
      };
    }
  };

  const [activity, setActivity] = useState<IActivity>(initializeForm);

  useEffect(() => {
    if (match.params.id && activity.id.length === 0) {
      loadActivity(match.params.id).then(
        () => initialFormState && setActivity(initialFormState)
      );
    }

    return () => {
      clearAtivity();
    };
  }, [
    loadActivity,
    clearAtivity,
    match.params.id,
    initialFormState,
    activity.id.length,
  ]);

  const handleInputChange = (
    e: FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setActivity({ ...activity, [e.currentTarget.name]: e.currentTarget.value });
  };

  const handleSubmit = () => {
    if (activity.id.length === 0) {
      let newActivity = {
        ...activity,
        id: uuid(),
      };
      createActivity(newActivity).then(() =>
        history.push(`/activities/${newActivity.id}`)
      );
    } else {
      editActivity(activity).then(() =>
        history.push(`/activities/${activity.id}`)
      );
    }
  };

  const handleFinalFormSubmit = (values: any) => {
    console.log(values);
  };

  return (
    <Grid>
      <Grid.Column width={10}>
        <Segment clearing>
          <FinalForm onSubmit={handleFinalFormSubmit} />
          <Form>
            <Form.Input
              placeholder='Title'
              value={activity.title}
              onChange={handleInputChange}
              name='title'
            />
            <Form.TextArea
              rows={2}
              placeholder='Description'
              value={activity.description}
              onChange={handleInputChange}
              name='description'
            />
            <Form.Input
              placeholder='Category'
              value={activity.category}
              onChange={handleInputChange}
              name='category'
            />
            <Form.Input
              type='datetime-local'
              placeholder='Date'
              value={activity.date}
              onChange={handleInputChange}
              name='date'
            />
            <Form.Input
              placeholder='City'
              value={activity.city}
              onChange={handleInputChange}
              name='city'
            />
            <Form.Input
              placeholder='Venue'
              value={activity.venue}
              onChange={handleInputChange}
              name='venue'
            />
            <Button
              floated='right'
              positive
              type='submit'
              content='Submit'
              onClick={() => handleSubmit()}
              loading={submitting}
            />
            <Button
              onClick={() => history.push("/activities")}
              floated='right'
              type='button'
              content='Cancel'
            />
          </Form>
        </Segment>
      </Grid.Column>
    </Grid>
  );
};

export default observer(ActivityForm);
