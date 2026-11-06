import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import type { Component } from "vue";
import { useModalStore } from "~/stores/modal";

const FirstModal = { name: "FirstModal" } as Component;
const SecondModal = { name: "SecondModal" } as Component;

describe("modal store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("opens a modal immediately with its component and props", () => {
    const store = useModalStore();
    const props = { title: "Подтверждение", count: 2 };

    const result = store.open(FirstModal, props);

    expect(store.activeModal).toMatchObject({
      id: 1,
      component: FirstModal,
      props,
      closing: false,
    });

    store.requestClose();
    store.finishClose();
    return expect(result).resolves.toBeUndefined();
  });

  it("uses empty props when none are provided", () => {
    const store = useModalStore();

    store.open(FirstModal);

    expect(store.activeModal?.props).toEqual({});
  });

  it("queues modals in order and resolves each promise with its close result", async () => {
    const store = useModalStore();
    const firstResult = store.open<string>(FirstModal, { order: 1 });
    const secondResult = store.open<number>(SecondModal, { order: 2 });

    expect(store.activeModal).toMatchObject({
      id: 1,
      component: FirstModal,
      props: { order: 1 },
      closing: false,
    });

    store.requestClose("first result");
    expect(store.activeModal).toMatchObject({
      id: 1,
      closing: true,
      result: "first result",
    });

    store.finishClose();
    await expect(firstResult).resolves.toBe("first result");
    expect(store.activeModal).toMatchObject({
      id: 2,
      component: SecondModal,
      props: { order: 2 },
      closing: false,
    });

    store.requestClose(42);
    store.finishClose();
    await expect(secondResult).resolves.toBe(42);
    expect(store.activeModal).toBeNull();
  });

  it("ignores close requests without an active modal", () => {
    const store = useModalStore();

    store.requestClose("ignored");
    store.finishClose();

    expect(store.activeModal).toBeNull();
  });

  it("does not change the first result or advance the queue on repeated close calls", async () => {
    const store = useModalStore();
    const firstResult = store.open(FirstModal);
    store.open(SecondModal);

    store.finishClose();
    expect(store.activeModal?.closing).toBe(false);

    store.requestClose("kept result");
    store.requestClose("ignored result");
    store.finishClose();
    store.finishClose();

    await expect(firstResult).resolves.toBe("kept result");
    expect(store.activeModal).toMatchObject({
      id: 2,
      component: SecondModal,
      closing: false,
    });
  });
});
