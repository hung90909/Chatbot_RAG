using LangChain.Providers.OpenAI;
using Microsoft.Extensions.Configuration;
using OpenAI;
using OpenAI.Chat;
using RAG.Model;
using System.Text.Json;

namespace RAG.Agents
{
    public interface IPlannerAgent
    {
        Task<ExecutionPlan> AnalyzeAsync(string question, string userId);
    }
    public class PlannerAgent : IPlannerAgent
    {
        private readonly ChatClient _chatClient;
        //  private readonly ILogger<PlannerAgent> _logger;
        public PlannerAgent(string apiKey, string model)
        {
          

        }



        public async Task<ExecutionPlan> AnalyzeAsync(string question, string userId)
        {

            var systemPrompt = """
        Bạn là Planner Agent cho hệ thống Quản lý Tài sản công.
        Nhiệm vụ: Phân tích câu hỏi và quyết định cần gọi module nào.

        Module:
        1. Retriever: Văn bản pháp luật PDF. Dùng khi hỏi quy định, thủ tục.
        2. SqlAgent: Query SQL Server. Dùng khi hỏi số liệu, thống kê, danh sách tài sản.
        3. ToolAgent: Gọi API. Tools: getAsset, getDepartment, getTransferHistory, getDepreciation.

        Bắt buộc trả về function call create_execution_plan.
        """;

            var createPlanTool = ChatTool.CreateFunctionTool(
                functionName: "create_execution_plan",
                functionDescription: "Tạo kế hoạch thực thi",
                functionParameters: BinaryData.FromString("""
            {
                "type": "object",
                "properties": {
                    "needsRetriever": { "type": "boolean" },
                    "needsSql": { "type": "boolean" },
                    "needsTools": { "type": "boolean" },
                    "tools": { "type": "array", "items": { "type": "string" } },
                    "reasoning": { "type": "string" },
                    "extractedEntities": {
                        "type": "object",
                        "properties": {
                            "assetName": { "type": "string" },
                            "assetId": { "type": "string" },
                            "departmentName": { "type": "string" }
                        }
                    }
                },
                "required": ["needsRetriever", "needsSql", "needsTools", "reasoning"]
            }
            """)
            );

            ChatCompletionOptions options = new()
            {
                Tools = { createPlanTool },
                ToolChoice = ChatToolChoice.CreateFunctionChoice("create_execution_plan"),
                Temperature = 0
            };

            List<ChatMessage> messages = [
                new SystemChatMessage(systemPrompt),
            new UserChatMessage(question)
            ];

            ChatCompletion completion = await _chatClient.CompleteChatAsync(messages, options);

            if (completion.ToolCalls.Count == 0)
                throw new InvalidOperationException("Planner không trả về tool call");

            var toolCall = completion.ToolCalls[0];
            var plan = JsonSerializer.Deserialize<ExecutionPlan>(
                toolCall.FunctionArguments,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );

         

            return plan!;
        }
    }
}
