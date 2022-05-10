import { ArrowLeft } from "phosphor-react-native";
import React, { useCallback, useState } from "react";
import { View, TextInput, Image, Text, TouchableOpacity } from "react-native";
import { theme } from "../../theme";
import { feedbackTypes } from "../../utils/feedbackTypes";
import { FeedbackType } from "../Widget";
import { ScreenshotButton } from "../ScreenshotButton";
import { captureScreen } from "react-native-view-shot";
import * as FileSystem from "expo-file-system";

import { styles } from "./styles";
import { Button } from "../Button";
import { api } from "../../libs/api";

interface FormProps {
  feedbackType: FeedbackType;
  onFeedbackCanceled: () => void;
  onFeedbackSent: () => void;
}
export function Form(props: FormProps) {
  const { feedbackType, onFeedbackSent, onFeedbackCanceled } = props;
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");
  const [isSendingFeedback, setISSendingFeedback] = useState(false);
  const feedbackTypeInfo = feedbackTypes[feedbackType];

  const handleScreenshot = useCallback(async () => {
    try {
      const capture = await captureScreen({
        format: "jpg",
        quality: 0.8,
      });
      setScreenshot(capture);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleScreenshotRemoval = useCallback(() => {
    setScreenshot(null);
  }, []);

  async function handleSendFeedback() {
    if (isSendingFeedback) {
      return;
    }
    setISSendingFeedback(true);
    const img64 =
      screenshot &&
      (await FileSystem.readAsStringAsync(screenshot, { encoding: "base64" }));
    try {
      await api.post("/feedbacks", {
        type: feedbackType,
        screenshot: `data:image/png;base64, ${img64}`,
        comment: comment,
      });
      onFeedbackSent();
    } catch (error) {
      console.log(error);
      setISSendingFeedback(false);
    }
    setISSendingFeedback(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onFeedbackCanceled}>
          <ArrowLeft
            size={24}
            weight="bold"
            color={theme.colors.text_secondary}
          />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Image source={feedbackTypeInfo.image} style={styles.image} />
          <Text style={styles.titleText}>{feedbackTypeInfo.title}</Text>
        </View>
      </View>
      <TextInput
        multiline
        style={styles.input}
        placeholder="Algo não está funcionando bem? Queremos corrigir. Conte com detalhes o que está acontecendo."
        placeholderTextColor={theme.colors.text_secondary}
        autoCorrect={false}
        onChangeText={setComment}
      />
      <View style={styles.footer}>
        <ScreenshotButton
          onTakeShot={handleScreenshot}
          onRemoveShot={handleScreenshotRemoval}
          screenshot={screenshot}
        />
        <Button onPress={handleSendFeedback} isLoading={isSendingFeedback} />
      </View>
    </View>
  );
}
