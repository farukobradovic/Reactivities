import React from "react";
import { FieldRenderProps } from "react-final-form";
import { Form, FormFieldProps, Label } from "semantic-ui-react";

interface IProps
  extends FieldRenderProps<string, HTMLTextAreaElement>,
    FormFieldProps {}

export const TextAreaInput: React.FC<IProps> = ({
  input,
  width,
  type,
  placeholder,
  rows,
  meta: { touched, error },
}) => {
  return (
    <Form.Field error={touched && !!error} width={width}>
      <textarea rows={rows} {...input} placeholder={placeholder} />
      {touched && error && (
        <Label basic color='red'>
          {error}
        </Label>
      )}
    </Form.Field>
  );
};