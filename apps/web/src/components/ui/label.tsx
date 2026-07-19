import * as React from "react";
import { cn } from "../../lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      // biome-ignore lint/a11y/noLabelWithoutControl: General purpose label wrapper component that forwards control binding
      <label
        ref={ref}
        className={cn(
          "text-xs font-bold text-slate-400 uppercase tracking-wider block",
          className,
        )}
        {...props}
      />
    );
  },
);
Label.displayName = "Label";

export { Label };
