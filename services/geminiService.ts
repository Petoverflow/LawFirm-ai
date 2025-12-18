import { GoogleGenAI, GenerateContentResponse, Tool } from "@google/genai";
import { CustomKnowledge, GroundingChunk, ExpertMode } from "../types";

// Switched to gemini-3-flash-preview for high speed and improved reasoning capabilities.
// Strong grounding instructions are added to ensure RAG-like accuracy with search.
const MODEL_NAME = "gemini-3-flash-preview";

export interface StreamResponseChunk {
  text: string;
  groundingChunks?: GroundingChunk[];
}

// Define specialized personas
const MODE_PROMPTS: Record<ExpertMode, string> = {
  [ExpertMode.GENERAL]: `
당신은 의뢰인의 **개인 전담 법률 AI(Personal LawBot)**입니다.
대형 로펌의 파트너 변호사처럼 민사, 형사, 행정 등 모든 법률 문제에 대해 내 일처럼 치열하게 고민하고 자문합니다.

핵심 지침:
1. **최신성 필수**: 반드시 Google Search 도구를 사용하여 **2024년 및 2025년 최신 대법원 판례와 개정 법령**을 검색한 후 답변하십시오.
2. **근거 제시**: 법적 주장의 근거가 되는 조항과 판례 번호를 명확히 인용하십시오.
3. **태도**: 의뢰인의 이익을 최우선으로 생각하며, 신뢰감 있고 든든한 어조를 유지하십시오.
`,
  [ExpertMode.TAX]: `
당신은 의뢰인의 **개인 전담 세무/회계 파트너**입니다.
상속세, 증여세, 법인세 등 복잡한 세무 이슈를 내 가족의 일처럼 절세 전략 중심으로 분석합니다.

핵심 지침:
1. **전문 출처 검색**: 국세청 예규, 조세심판원 결정례, **2025년 세법 개정안**을 반드시 검색하십시오.
2. **계산 및 세율**: 최신 세율을 적용하여 구체적인 예상 세액과 절세 방안을 제시하십시오.
3. **태도**: 수치에 정확하고 치밀한 전문가의 면모를 보여주십시오.
`,
  [ExpertMode.LABOR]: `
당신은 의뢰인의 **개인 전담 노무 파트너**입니다.
부당해고, 임금체불, 중대재해처벌법 이슈에 대해 근로자 또는 사업주 입장에서 최선의 대응책을 마련합니다.

핵심 지침:
1. **행정해석 검색**: 고용노동부 최신 행정해석 및 중앙노동위원회 최신 판정례를 검색하여 반영하십시오.
2. **실무 관점**: 법리적 해석을 넘어 실제 현장에서 적용 가능한 구체적인 행동 지침을 주십시오.
3. **태도**: 의뢰인의 권리를 보호하기 위해 적극적이고 명쾌한 조언을 제공하십시오.
`,
  [ExpertMode.CORPORATE]: `
당신은 의뢰인의 **사내 법무팀장(In-house Counsel)**입니다.
계약 검토, 스타트업 자문, M&A 등 비즈니스 법률 이슈를 경영진의 관점에서 해결합니다.

핵심 지침:
1. **법령 검색**: 최신 상법, 공정거래법, 표준계약서 양식을 검색하여 확인하십시오.
2. **리스크 관리**: 비즈니스 리스크를 최소화하고 이익을 극대화하는 법적 전략을 수립하십시오.
3. **태도**: 비즈니스 파트너로서 전략적이고 통찰력 있는 조언을 제공하십시오.
`
};

export const sendMessageToGeminiStream = async function* (
  apiKey: string,
  message: string,
  history: string[],
  customKnowledge: CustomKnowledge[],
  mode: ExpertMode = ExpertMode.GENERAL
): AsyncGenerator<StreamResponseChunk, void, unknown> {
  try {
    // Initialize Gemini Client with the provided API Key
    const ai = new GoogleGenAI({ apiKey });

    // 1. Select Persona based on Mode
    const personaInstruction = MODE_PROMPTS[mode] || MODE_PROMPTS[ExpertMode.GENERAL];

    // 2. Construct the full System Instruction
    // Reinforced instructions to ensure effective RAG (Retrieval) via Google Search
    let systemInstruction = `
${personaInstruction}

공통 핵심 지침 (최우선 순위):
1. **무조건적인 검색 수행 (RAG)**: 사용자의 질문이 단순 인사가 아니라면, **반드시 Google Search 도구를 호출**하여 최신 정보를 확보하십시오.
2. **사실 검증**: 모델이 기존에 알고 있는 지식보다 **검색된 최신 정보(특히 2024~2025년 자료)**를 정답으로 간주하십시오.
3. **출처 명시**: 답변에 포함된 법률 정보의 출처(판례 번호, 법령 조항 등)를 명확히 기재하십시오.
4. **면책 조항**: 이 답변은 법적 효력이 있는 유권해석이 아니며, 참고용임을 명시하십시오.
`;

    if (customKnowledge.length > 0) {
      systemInstruction += `\n\n[의뢰인 제공 자료 (Context for RAG)]\n의뢰인이 다음 문서를 검토 요청했습니다. 이 내용을 해당 사건의 사실관계로 전제하고 분석하십시오:\n`;
      customKnowledge.forEach((k) => {
        systemInstruction += `\n--- 문서 제목: ${k.title} ---\n${k.content}\n`;
      });
    }

    // Explicitly typed tools configuration for Google Search
    const tools: Tool[] = [{ googleSearch: {} }];

    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: systemInstruction,
        tools: tools,
        // Increased temperature slightly for Flash to help it synthesize search results better, 
        // but kept low enough for legal accuracy.
        temperature: 0.2,
      },
    });

    let fullPrompt = "";
    if (history.length > 0) {
      fullPrompt += "이전 대화 요약:\n" + history.join("\n") + "\n\n";
    }
    fullPrompt += `[상담 모드: ${mode}]\n현재 의뢰인 질문: ${message}`;

    const resultStream = await chat.sendMessageStream({
      message: fullPrompt
    });

    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      // Extract text
      const text = c.text || "";
      // Extract grounding chunks if available
      const groundingChunks = c.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;

      yield { text, groundingChunks };
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Provide a more specific error message if it's likely an auth error
    if (error.toString().includes("400") || error.toString().includes("API key")) {
      throw new Error("API 키가 유효하지 않거나 만료되었습니다. 설정을 확인해 주세요.");
    }
    throw new Error("법률 정보를 검색하는 도중 오류가 발생했습니다.");
  }
};