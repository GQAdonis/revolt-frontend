import { Form, Typography } from "@revolt/ui";
import { getInitialValues } from "@revolt/ui/components/tools/Form";
import type {
  Action,
  Props as ModalProps,
} from "@revolt/ui/components/design/atoms/display/Modal";
import type {
  FormTemplate,
  MapFormToValues,
  Props as FormProps,
} from "@revolt/ui/components/tools/Form";
import { createSignal, Show, splitProps } from "solid-js";
import { Modals, PropGenerator } from "./types";
import { createStore } from "solid-js/store";
import { useTranslation } from "@revolt/i18n";

type Props<T extends FormTemplate> = Omit<
  FormProps<T>,
  "onChange" | "store" | "setStore" | "submitBtn" | "onSubmit"
> & {
  /**
   * Form submission callback
   */
  callback: (values: MapFormToValues<T>) => Promise<void>;

  /**
   * Submit button properties
   */
  submit?: Omit<Action, "onClick" | "confirmation">;

  /**
   * Custom actions after submit button
   */
  actions?: Action[];

  /**
   * Props for the modal
   */
  modalProps?: Omit<ModalProps, "disabled" | "actions">;
};

/**
 * Create a modal from form data
 */
export function createFormModal<
  T extends FormTemplate,
  P extends Modals["type"]
>(props: Props<T>): ReturnType<PropGenerator<P>> {
  const t = useTranslation();
  const [localProps, formProps] = splitProps(props, [
    "callback",
    "submit",
    "actions",
    "modalProps",
  ]);

  const [store, setStore] = createStore(
    getInitialValues(formProps.schema, formProps.defaults)
  );

  const [error, setError] = createSignal<string>(null!);
  const [processing, setProcessing] = createSignal(false);

  const onSubmit = async () => {
    try {
      setProcessing(true);
      await localProps.callback(store);
      return true;
    } catch (err) {
      // ! FIXME: map error
      setError("" + err);
      setProcessing(false);
      return false;
    }
  };

  return {
    ...localProps.modalProps,
    disabled: processing(),
    actions: [
      {
        onClick: onSubmit,
        children: t("actions.submit"),
        confirmation: true,
        ...props.submit,
      },
      ...(props.actions ?? [
        {
          onClick: () => true,
          children: t("app.special.modals.actions.cancel"),
          palette: "plain",
        },
      ]),
    ],
    children: (
      <>
        <Form
          {...formProps}
          store={store}
          setStore={setStore}
          onSubmit={onSubmit}
        />
        <Show when={error()}>
          <Typography variant="label">
            {t(`error.${error()}`, undefined, error())}
          </Typography>
        </Show>
      </>
    ),
  };
}
