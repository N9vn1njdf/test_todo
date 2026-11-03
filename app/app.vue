<template>
  <main class="h-screen flex items-center justify-center bg-gray-100">
    <div
      class="w-full max-w-5xl h-[calc(100vh-100px)] bg-white border border-secondary rounded-2xl"
    >
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
    <ModalHost />
  </main>
</template>
