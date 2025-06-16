import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { useState } from "react";
import type z from "zod";
import type {
  Toolkits,
  ServerToolkitParameters,
} from "@/toolkits/toolkits/shared";
import type { ClientToolkit } from "@/toolkits/types";
import type { SelectedToolkit } from "./types";

interface ClientToolkitConfigureProps {
  toolkit: ClientToolkit;
  id: Toolkits;
  schema: z.ZodObject<z.ZodRawShape>;
  onAdd: (toolkit: SelectedToolkit) => void;
  initialParameters?: Record<string, unknown>;
  isUpdate?: boolean;
}

export const ClientToolkitConfigure: React.FC<ClientToolkitConfigureProps> = ({
  toolkit,
  id,
  schema,
  onAdd,
  initialParameters = {},
  isUpdate = false,
}) => {
  const [parameters, setParameters] = useState<
    ServerToolkitParameters[typeof id]
  >((initialParameters as ServerToolkitParameters[typeof id]) || ({} as ServerToolkitParameters[typeof id]));

  const handleSubmit = () => {
    onAdd({ id, toolkit, parameters });
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium">
          {isUpdate ? `Configure ${toolkit.name}` : toolkit.name}
        </h4>
      </div>

      <div className="space-y-4">
        {toolkit.form && (
          <toolkit.form parameters={parameters} setParameters={setParameters} />
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!schema.safeParse(parameters).success}
        className="w-full"
      >
        {isUpdate ? (
          <>
            <Settings className="mr-2 size-4" />
            Update {toolkit.name}
          </>
        ) : (
          <>
            <Plus className="mr-2 size-4" />
            Add {toolkit.name}
          </>
        )}
      </Button>
    </div>
  );
};
