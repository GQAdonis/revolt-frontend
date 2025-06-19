import { Match, Show, Switch, splitProps } from "solid-js";

import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import MdClose from "@material-design-icons/svg/filled/close.svg?component-solid";

import { Button, Ripple } from "../../design";
import { Row } from "../../layout";

interface Props {
  /**
   * Currently selected file(s),
   * a URL for a preview,
   * or no file at all.
   */
  file: File[] | string | null;

  /**
   * Callback for selected file(s)
   *
   * Your consumer code should perform
   * additional validation such as file size.
   * @param files Selected File(s)
   */
  onFiles: (files: File[] | null) => void;

  /**
   * Whether to accept multiple files
   */
  multiple?: false;

  /**
   * What type of files to accept
   */
  accept?: "image/*";

  imageAspect?: string;
  imageRounded?: boolean;
  imageJustify?: boolean;
  allowRemoval?: boolean;

  required: boolean;
  disabled: boolean;
}

/**
 * Form element for collecting files
 */
export function FileInput(props: Props) {
  const [local, remote] = splitProps(props, ["file", "onFiles", "multiple"]);
  let inputRef: HTMLInputElement | undefined;

  /**
   * Handle file selection
   */
  function onChange(e: Event & { currentTarget: HTMLInputElement }) {
    console.info(e.currentTarget);
    if (e.currentTarget.files) {
      // NB. need to help out with the reactivity by
      //     first removing the array, and then setting
      //     the new one; otherwise no update! ¯\_(ツ)_/¯
      local.onFiles(null);
      local.onFiles([...e.currentTarget.files]);
    }
  }

  /**
   * Handle clear
   */
  function onClear() {
    inputRef!.value = null!;
    local.onFiles(null);
  }

  function imageSrc() {
    if (typeof local.file === "string") {
      return local.file;
    } else if (Array.isArray(local.file)) {
      // purportedly, we don't need to revoke:
      // https://stackoverflow.com/a/49346614
      return URL.createObjectURL(local.file[0]);
    } else {
      return "";
    }
  }

  return (
    <Switch
      fallback={
        <>
          <input ref={inputRef} type="file" onChange={onChange} {...remote} />
          <Show when={local.file?.length || 0 > 0}>
            <Button
              size="icon"
              variant="plain"
              onPress={onClear}
              isDisabled={!props.file}
            >
              X
            </Button>
          </Show>
        </>
      }
    >
      <Match when={props.accept === "image/*"}>
        <input
          type="file"
          ref={inputRef}
          class={css({
            display: "none",
          })}
          onChange={onChange}
          {...remote}
        />
        <Row align justify={props.imageJustify ?? true} gap="lg">
          <ImagePreview
            onClick={() => inputRef!.click()}
            style={{
              "aspect-ratio": props.imageAspect ?? "1/1",
            }}
            rounded={props.imageRounded ?? true}
          >
            <Ripple />
            <Show when={local.file}>
              <img src={imageSrc()} />
            </Show>
          </ImagePreview>
          <Show when={props.allowRemoval !== false}>
            <Button
              size="icon"
              variant="plain"
              onPress={onClear}
              isDisabled={!props.file}
            >
              <MdClose />
            </Button>
          </Show>
        </Row>
      </Match>
    </Switch>
  );
}

const ImagePreview = styled("div", {
  base: {
    cursor: "pointer",
    position: "relative",
    height: "96px",

    backgroundColor: "var(--md-sys-color-surface-dim)",

    "& img": {
      display: "block",
      height: "100%",
      width: "100%",

      objectFit: "cover",
    },
  },
  variants: {
    rounded: {
      true: {
        borderRadius: "50%",

        "& img": {
          borderRadius: "50%",
        },
      },
      false: {
        borderRadius: "var(--borderRadius-lg)",

        "& img": {
          borderRadius: "var(--borderRadius-lg)",
        },
      },
    },
  },
});
