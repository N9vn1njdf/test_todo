import { markRaw, shallowRef, type Component } from "vue";
import { defineStore } from "pinia";

interface ModalEntry {
  id: number;
  component: Component;
  props: Record<string, unknown>;
  closing: boolean;
  result?: unknown;
}

interface PendingModal {
  id: number;
  component: Component;
  props: Record<string, unknown>;
  resolve: (result: unknown) => void;
}

export const useModalStore = defineStore("modal", () => {
  const activeModal = shallowRef<ModalEntry | null>(null);
  const pendingModals: PendingModal[] = [];
  let activeResolve: ((result: unknown) => void) | null = null;
  let nextId = 0;

  function activateNext(): void {
    const next = pendingModals.shift();
    if (!next) {
      activeModal.value = null;
      activeResolve = null;
      return;
    }

    activeResolve = next.resolve;
    activeModal.value = {
      id: next.id,
      component: next.component,
      props: next.props,
      closing: false,
    };
  }

  function open<T = unknown>(
    component: Component,
    props: Record<string, unknown> = {},
  ): Promise<T> {
    return new Promise<T>((resolve) => {
      pendingModals.push({
        id: ++nextId,
        component: markRaw(component),
        props,
        resolve: resolve as (result: unknown) => void,
      });

      if (!activeModal.value) {
        activateNext();
      }
    });
  }

  function requestClose(result?: unknown): void {
    if (!activeModal.value || activeModal.value.closing) {
      return;
    }

    activeModal.value = {
      ...activeModal.value,
      closing: true,
      result,
    };
  }

  function finishClose(): void {
    const closingModal = activeModal.value;
    if (!closingModal?.closing) {
      return;
    }

    const resolve = activeResolve;
    activateNext();
    resolve?.(closingModal.result);
  }

  return {
    activeModal,
    open,
    requestClose,
    finishClose,
  };
});
