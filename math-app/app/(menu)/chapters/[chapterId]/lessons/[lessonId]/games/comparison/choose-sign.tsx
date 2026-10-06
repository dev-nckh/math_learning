import React from "react";
import { router, useLocalSearchParams } from "expo-router";

import ScreenShell from "./components/ScreenShell";
import ChooseSignGame from "./ChooseSignGame";

export default function ChooseSignScreen() {
  const { chapterId, lessonId } = useLocalSearchParams<{
    chapterId: string;
    lessonId: string;
  }>();

  const backToIndex = () => {
    router.replace({
      pathname:
        "/(menu)/chapters/[chapterId]/lessons/[lessonId]/games/comparison",
      params: { chapterId, lessonId },
    });
  };

  return (
    <ScreenShell title="Chọn dấu đúng" onBack={backToIndex}>
      <ChooseSignGame />
    </ScreenShell>
  );
}
