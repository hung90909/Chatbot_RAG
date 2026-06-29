namespace RAG.Model
{
    public class RagAnswer
    {
        public string Text { get; set; }
        public List<Source> Sources { get; set; }
    }

    public class Source
    {
        public int Page { get; set; }
        public string Content { get; set; }
    }
}
