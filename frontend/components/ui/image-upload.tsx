import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  onChange: (value: File) => void;
  value?: File;
}

export function ImageUpload({ onChange, value }: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onChange(acceptedFiles[0]);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className="
        relative
        cursor-pointer
        hover:opacity-70
        border
        border-dashed
        border-gray-300
        p-20
        border-neutral-400
        flex
        flex-col
        justify-center
        items-center
        gap-2
        text-neutral-600
      "
    >
      <input {...getInputProps()} />
      {value ? (
        <div className="relative w-full h-full">
          <Image
            src={URL.createObjectURL(value)}
            alt="Uploaded image"
            fill
            className="object-cover"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange(undefined);
            }}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <ImagePlus size={50} />
          <div className="font-semibold text-lg">
            {isDragActive ? "Déposez l'image ici" : "Cliquez pour sélectionner"}
          </div>
          <div className="text-neutral-500 text-sm">
            PNG, JPG, JPEG jusqu'à 10MB
          </div>
        </>
      )}
    </div>
  );
}
