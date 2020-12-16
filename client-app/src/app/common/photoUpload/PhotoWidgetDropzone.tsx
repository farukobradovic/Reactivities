import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Header, Icon } from "semantic-ui-react";

interface IProps {
  setFiles: (files: object[]) => void;
}

const dropzoneStyle = {
  border: "dashed 3px",
  borderColor: "#eee",
  borderRadius: "5px",
  paddingTop: "3px",
  textAlign: "center" as "center",
  height: "200px",
};
const dropzoneActive = {
  borderColor: "green",
};

const PhotoWidgetDropzone: React.FC<IProps> = ({ setFiles }) => {
  const onDrop = useCallback((acceptedFiles) => {
    // Do something with the files
    setFiles(
      acceptedFiles.map((file: object) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      )
    );
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      style={
        isDragActive ? { ...dropzoneStyle, ...dropzoneActive } : dropzoneStyle
      }
    >
      <input {...getInputProps()} />

      <Icon name='upload' size='huge' />
      <Header content='Drop image here' />
    </div>
  );
};

export default PhotoWidgetDropzone;
