//using Azure;
//using LangChain.Providers;
//using System.Diagnostics;

//namespace Rag.Service
//{
//    public interface IAiOrchestrator
//    {

//    }

//    public class AiOrchestrator : IAiOrchestrator
//    {
//        private readonly PlannerAgent _planner;
//        private readonly RetrieverService _retriever;
//        private readonly SqlAgentService _sqlAgent;
//        private readonly ToolAgentService _toolAgent;
//        private readonly IChatModel _gpt;

//        public async Task<AiResponse> ProcessAsync(string question, string userId)
//        {
//            var sw = Stopwatch.StartNew();

//            // B1: Planner phân tích intent - cần SQL, Vector hay Tool?
//            var plan = await _planner.AnalyzeAsync(question);

//            var contextTasks = new List<Task>();
//            List<DocumentChunk> chunks = new();
//            SqlResult sqlResult = null;
//            List<ToolCall> toolResults = new();

//            // B2: Chạy song song Retriever + SQL + Tool theo plan
//            if (plan.NeedsRetriever)
//                contextTasks.Add(Task.Run(async () => chunks = await _retriever.SearchAsync(question, topK: 5)));

//            if (plan.NeedsSql)
//                contextTasks.Add(Task.Run(async () => sqlResult = await _sqlAgent.QueryAsync(question)));

//            if (plan.NeedsTools)
//                contextTasks.Add(Task.Run(async () => toolResults = await _toolAgent.ExecuteAsync(question, plan.Tools)));

//            await Task.WhenAll(contextTasks);

//            // B3: Ghép context + Memory
//            var memory = await _conversationService.GetHistoryAsync(userId);
//            var prompt = PromptBuilder.Build(question, chunks, sqlResult, toolResults, memory);

//            // B4: Gọi GPT-5
//            var answer = await _gpt.GenerateAsync(prompt);

//            // B5: Lưu log Module 12
//            await _loggingService.LogAsync(question, answer, sw.ElapsedMilliseconds);

//            return new AiResponse
//            {
//                Answer = answer,
//                GeneratedSql = sqlResult?.Sql,
//                RetrieverChunks = chunks,
//                ToolCalls = toolResults,
//                LatencyMs = sw.ElapsedMilliseconds
//            };
//        }
//    }

//}