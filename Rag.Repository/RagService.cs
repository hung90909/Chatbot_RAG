//using Microsoft.Extensions.Configuration;
//using Microsoft.SemanticKernel;
//using Microsoft.SemanticKernel.Connectors.OpenAI;
//using Microsoft.SemanticKernel.Memory;
//using System;
//using System.Collections;

//namespace Rag.Service
//{
//    public class RagService
//    {
//        private readonly IKernelBuilder _kernelBuilder;
//        private ISemanticTextMemory _memory;
//        private Kernel _kernel;
//        private const string CollectionName = "taiSanCong";

//        public RagService(IConfiguration config)
//        {
//            var openAiKey = config["OpenAI:ApiKey"];

//            _kernelBuilder = Kernel.CreateBuilder()
//               .AddOpenAIChatCompletion("gpt-4o-mini", openAiKey)
//               .AddOpenAITextEmbeddingGeneration("text-embedding-3-small", openAiKey);

//            // Dùng SQLite làm Vector DB, chạy local không cần cài gì
//            _memory = new MemoryBuilder()
//               .WithOpenAITextEmbeddingGeneration("text-embedding-3-small", openAiKey)
//               .WithMemoryStore(new SqliteMemoryStore("rag_memory.db"))
//               .Build();

//            _kernel = _kernelBuilder.Build();
//        }
//        // 1. Upload PDF → Chunk → Embed → Lưu DB
//        public async Task<int> IndexPdfAsync(IFormFile file)
//        {
//            // Đọc PDF
//            using var stream = file.OpenReadStream();
//            using var pdf = PdfDocument.Open(stream);
//            var fullText = string.Join("\n", pdf.GetPages().Select(p => p.Text));

//            // Chunk 1000 ký tự
//            var chunks = SplitText(fullText, 1000, 200);
//            int count = 0;

//            // Embed và lưu từng chunk
//            foreach (var chunk in chunks)
//            {
//                await _memory.SaveInformationAsync(
//                    collection: CollectionName,
//                    text: chunk.Text,
//                    id: $"chunk_{count}",
//                    description: $"Trang {chunk.Page}"
//                );
//                count++;
//            }
//            return count;
//        }

//        // 2. Hỏi → Retrieve → Generate
//        public async Task<RagAnswer> AskAsync(string question)
//        {
//            // Retrieve: tìm 3 chunks liên quan nhất
//            var searchResults = _memory.SearchAsync(CollectionName, question, limit: 3);
//            var context = "";
//            var sources = new List<Source>();

//            await foreach (var result in searchResults)
//            {
//                context += result.Metadata.Text + "\n\n";
//                sources.Add(new Source
//                {
//                    Page = int.Parse(result.Metadata.Description.Replace("Trang ", "")),
//                    Content = result.Metadata.Text.Substring(0, Math.Min(150, result.Metadata.Text.Length)) + "..."
//                });
//            }

//            if (string.IsNullOrEmpty(context))
//                return new RagAnswer { Text = "Không tìm thấy trong tài liệu.", Sources = new() };

//            // Generate: Ghép prompt
//            var prompt = """
//            Bạn là trợ lý tài sản công. Chỉ trả lời dựa trên context.
//            Nếu không có thông tin, nói "Không tìm thấy".

//            Context: {{$context}}

//            Câu hỏi: {{$question}}
//            """;

//            var func = _kernel.CreateFunctionFromPrompt(prompt);
//            var result = await _kernel.InvokeAsync(func, new()
//            {
//                ["context"] = context,
//                ["question"] = question
//            });

//            return new RagAnswer
//            {
//                Text = result.GetValue<string>(),
//                Sources = sources
//            };
//        }

//        private List<(string Text, int Page)> SplitText(string text, int size, int overlap)
//        {
//            var chunks = new List<(string, int)>();
//            for (int i = 0; i < text.Length; i += size - overlap)
//            {
//                var chunk = text.Substring(i, Math.Min(size, text.Length - i));
//                chunks.Add((chunk, 1)); // Tạm hardcode page = 1, bạn parse PDF kỹ hơn để lấy số trang
//            }
//            return chunks;
//        }
//    }
//}
