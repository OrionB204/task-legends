
/**
 * Utilitário para validar evidências usando IA (Simulado para integração futura)
 * Para produção, você deve usar uma Edge Function do Supabase ou uma API de Visão (Gemini/OpenAI)
 */

export interface AIAnalysisResult {
    approved: boolean;
    reason: string;
    confidence: number;
}

export async function analyzeEvidenceWithAI(
    imageFile: File,
    taskTitle: string,
    taskDescription: string
): Promise<AIAnalysisResult> {
    // Simulando atraso de processamento da IA
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Aqui você faria a chamada real para a API de Visão.
    // Exemplo com Gemini Vision:
    /*
    const base64Image = await fileToBase64(imageFile);
    const response = await fetch('YOUR_AI_ENDPOINT', {
        method: 'POST',
        body: JSON.stringify({
            image: base64Image,
            prompt: `Analise se esta foto comprova a conclusão da tarefa: "${taskTitle}". Descrição: ${taskDescription}. Responda apenas com APROVADO ou REPROVADO e o motivo.`
        })
    });
    */

    // Lógica de simulação baseada em palavras-chave simples apenas para demonstração
    const isMockFail = imageFile.name.toLowerCase().includes('fail') ||
        taskTitle.toLowerCase().includes('erro') ||
        Math.random() < 0.1; // 10% de chance de "recusa aleatória" para teste

    if (isMockFail) {
        return {
            approved: false,
            reason: "A imagem não parece conter elementos que comprovem a conclusão da tarefa descrita.",
            confidence: 0.92
        };
    }

    return {
        approved: true,
        reason: "IA validou que as características da foto condizem com a tarefa.",
        confidence: 0.98
    };
}

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}
