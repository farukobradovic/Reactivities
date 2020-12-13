import React, { useState, FormEvent, useContext, useEffect } from "react";
import { Button, Form, Grid, Segment } from "semantic-ui-react";
import { ActivityFormValues } from "../../../app/models/activity";
import { v4 as uuid } from "uuid";
import ActivityStore from "../../../app/stores/activityStore";
import { observer } from "mobx-react-lite";
import { RouteComponentProps } from "react-router-dom";
import { Form as FinalForm, Field } from "react-final-form";
import TextInput from "../../../app/common/form/TextInput";
import { TextAreaInput } from "../../../app/common/form/TextAreaInput";
import SelectInput from "../../../app/common/form/SelectInput";
import { category } from "../../../app/common/options/CategoryOptions";
import DateInput from "../../../app/common/form/DateInput";
import { combineDateAndTime } from "../../../app/common/util/util";
import {
  combineValidators,
  composeValidators,
  hasLengthGreaterThan,
  isRequired,
} from "revalidate";
import { RootStoreContext } from "../../../app/stores/rootStore";

const validate = combineValidators({
  title: isRequired({ message: "The event title is required" }),
  category: isRequired("Category"),
  description: composeValidators(
    isRequired("Description"),
    hasLengthGreaterThan(4)({
      message: "Description needs to be at least 5 characters",
    })
  )(),
  city: isRequired("City"),
  venue: isRequired("Venue"),
  date: isRequired("Date"),
  time: isRequired("Time"),
});

interface DetailParams {
  id: string;
}

const ActivityForm: React.FC<RouteComponentProps<DetailParams>> = ({
  match,
  history,
}) => {
  const rootStore = useContext(RootStoreContext);
  const {
    createActivity,
    editActivity,
    submitting,
    activity: initialFormState,
    loadActivity,
  } = rootStore.activityStore;

  // const initializeForm = () => {
  //   if (initialFormState) {
  //     return initialFormState;
  //   } else {
  //     return {
  //       id: "",
  //       title: "",
  //       category: "",
  //       description: "",
  //       date: undefined,
  //       time: undefined,
  //       city: "",
  //       venue: "",
  //     };
  //   }
  // };

  const [activity, setActivity] = useState(new ActivityFormValues());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (match.params.id) {
      setLoading(true);
      loadActivity(match.params.id)
        .then(
          //ovdje vracamo activity inace bi bio promise
          (activity) => setActivity(new ActivityFormValues(activity))
        )
        .finally(() => setLoading(false));
    }
  }, [loadActivity, match.params.id]);

  // const handleSubmit = () => {
  //   if (activity.id.length === 0) {
  //     let newActivity = {
  //       ...activity,
  //       id: uuid(),
  //     };
  //     createActivity(newActivity).then(() =>
  //       history.push(`/activities/${newActivity.id}`)
  //     );
  //   } else {
  //     editActivity(activity).then(() =>
  //       history.push(`/activities/${activity.id}`)
  //     );
  //   }
  // };

  const handleFinalFormSubmit = (values: any) => {
    const dateAndTime = combineDateAndTime(values.date, values.time);
    const { date, time, ...activity } = values;
    activity.date = dateAndTime;
    if (!activity.id) {
      let newActivity = {
        ...activity,
        id: uuid(),
      };
      createActivity(newActivity);
    } else {
      editActivity(activity);
    }
  };
  // const handleInputChange = (
  //   e: FormEvent<HTMLInputElement | HTMLTextAreaElement>
  // ) => {
  //   setActivity({ ...activity, [e.currentTarget.name]: e.currentTarget.value });
  // };
  return (
    <Grid>
      <Grid.Column width={10}>
        <Segment clearing>
          <FinalForm
            validate={validate}
            initialValues={activity}
            onSubmit={handleFinalFormSubmit}
            render={({ handleSubmit, invalid, pristine }) => (
              <Form onSubmit={handleSubmit} loading={loading}>
                <Field
                  placeholder='Title'
                  value={activity.title}
                  name='title'
                  component={TextInput}
                />
                <Field
                  placeholder='Description'
                  value={activity.description}
                  name='description'
                  rows={3}
                  component={TextAreaInput}
                />
                <Field
                  placeholder='Category'
                  value={activity.category}
                  name='category'
                  component={SelectInput}
                  options={category}
                />
                <Form.Group widths='equal'>
                  <Field
                    component={DateInput}
                    placeholder='Date'
                    value={activity.date}
                    name='date'
                    date={true}
                  />
                  <Field
                    component={DateInput}
                    placeholder='Time'
                    value={activity.date}
                    name='time'
                    time={true}
                  />
                </Form.Group>

                <Field
                  placeholder='City'
                  value={activity.city}
                  component={TextInput}
                  name='city'
                />
                <Field
                  placeholder='Venue'
                  value={activity.venue}
                  component={TextInput}
                  name='venue'
                />
                <Button
                  floated='right'
                  positive
                  type='submit'
                  content='Submit'
                  loading={submitting}
                  disabled={loading || invalid || pristine}
                />
                <Button
                  onClick={
                    activity.id
                      ? () => history.push(`/activities/${activity.id}`)
                      : () => history.push("/activities")
                  }
                  floated='right'
                  type='button'
                  content='Cancel'
                />
              </Form>
            )}
          />
        </Segment>
      </Grid.Column>
    </Grid>
  );
};

export default observer(ActivityForm);
