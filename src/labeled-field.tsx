import type { ReactNode } from "react";
import { Field as ShadcnField, FieldLabel } from "./components/ui/field";

export function Field({
  children,
  htmlFor,
  label,
}: {
  children: ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <ShadcnField>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
    </ShadcnField>
  );
}
