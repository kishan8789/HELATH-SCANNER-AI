export const checkSymptoms = (problemType: string, userAnswers: string[]) => {
  const logic: any = {
    acne: {
      questions: ["Kya itching ho rahi hai?", "Kya pimples dard kar rahe hain?"],
      evaluate: (answers: string[]) => {
        if (answers.includes("yes")) return "Severe Inflammation detected. Steroid-free cream use karein.";
        return "Mild acne hai, regular wash se theek ho jayega.";
      }
    },
    nutrition: {
      questions: ["Kya aapko thakan mehsoos hoti hai?", "Kya baal jhad rahe hain?"],
      evaluate: (answers: string[]) => {
        if (answers.includes("yes")) return "Chronic deficiency ke sanket hain. Blood test zaroori hai.";
        return "Dietary change se sudhaar ho jayega.";
      }
    }
  };
  return logic[problemType];
};