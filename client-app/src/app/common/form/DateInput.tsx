import React from "react";
import { FieldRenderProps } from "react-final-form";
import { Form, FormFieldProps, Label } from "semantic-ui-react";
import { DateTimePicker } from "react-widgets";

interface IProps
  extends FieldRenderProps<Date, HTMLInputElement>,
    FormFieldProps {}

const DateInput: React.FC<IProps> = ({
  date = false,
  time = false,
  input,
  width,
  placeholder,
  meta: { touched, error },
  ...rest
}) => {
  return (
    //sa !! naglasavamo da nam vrati bool
    <Form.Field error={touched && !!error} width={width}>
      <DateTimePicker
        placeholder={placeholder}
        value={input.value || null}
        onChange={input.onChange}
        onBlur={input.onBlur}
        onKeyDown={(e) => e.preventDefault()} //Da se ne moze kucati u datum
        date={date}
        time={time}
      />
      {touched && error && (
        <Label basic color='red'>
          {error}
        </Label>
      )}
    </Form.Field>
  );
};

export default DateInput;
