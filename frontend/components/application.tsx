import type { Application } from "@/lib/applications";

interface ApplicationProps {
  application: Application;
}

export function Application({ application }: ApplicationProps) {
  return (
    <div>
      <h1>{application.name}</h1>
      <p>{application.description}</p>
    </div>
  );
}
