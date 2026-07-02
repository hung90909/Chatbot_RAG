using System;

namespace RAG.Model
{
    //public class OpenAiFunction
    //{
    //    public string Name { get; set; } = string.Empty;
    //    public string Description { get; set; } = string.Empty;
    //    public BinaryData Parameters { get; set; } = BinaryData.Empty;
    //}

    //public class ChatRequest
    //{
    //    public List<Message> Messages { get; set; } = new();
    //    public List<OpenAiFunction>? Functions { get; set; }
    //    public FunctionCall? FunctionCall { get; set; }
    //    public string Model { get; set; } = "gpt-5";
    //    public float Temperature { get; set; } = 0;
    //}

    public class Message
    {
        public string Role { get; set; } = string.Empty;
        public string? Content { get; set; }
        public FunctionCall? FunctionCall { get; set; }

        public Message(string content, string role)
        {
            Content = content;
            Role = role;
        }
    }

    public class FunctionCall
    {
        public string Name { get; set; } = string.Empty;
      //  public BinaryData? Arguments { get; set; }
    }

    public class ChatResponse
    {
        public Message Message { get; set; } = new("", "");
        public int TotalTokens { get; set; }
    }
}
