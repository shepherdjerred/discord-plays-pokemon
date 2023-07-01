import { match } from "ts-pattern";
import "twin.macro";
import IconCheckMark from "~icons/ph/check-circle";
import IconError from "~icons/ph/x-circle";
import IconClose from "~icons/ph/x";
import IconWarning from "~icons/ph/warning-circle";
import IconInfo from "~icons/ph/info";

export function Notification({
  title = "",
  message = "",
  dismissable = true,
  type,
}: {
  title?: string;
  message?: string;
  type?: "success" | "error" | "warning" | "info";
  dismissable?: boolean;
}) {
  const icon = match(type)
    .with("success", () => {
      return <IconCheckMark tw="text-green-500" />;
    })
    .with("info", () => {
      return <IconInfo tw="text-blue-500" />;
    })
    .with("warning", () => {
      return <IconWarning tw="text-orange-500" />;
    })
    .with("error", () => {
      return <IconError tw="text-red-500" />;
    })
    .otherwise(() => {
      return null;
    });

  const dismissButton = match(dismissable)
    .with(true, () => {
      return (
        <button
          type="button"
          tw="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <span tw="sr-only">Close</span>
          <IconClose />
        </button>
      );
    })
    .otherwise(() => null);

  return (
    <div tw="flex w-full flex-col items-center space-y-4 sm:items-end">
      <div tw="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
        <div tw="p-4">
          <div tw="flex items-start">
            {icon}
            <div tw="ml-3 w-0 flex-1 pt-0.5">
              <p tw="text-sm font-medium text-gray-900">{title}</p>
              <p tw="mt-1 text-sm text-gray-500">{message}</p>
            </div>
            <div tw="ml-4 flex flex-shrink-0">{dismissButton}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
