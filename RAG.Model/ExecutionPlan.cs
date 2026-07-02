namespace RAG.Model
{
    public class ExecutionPlan
    {
        public bool NeedsRetriever { get; set; }
        public bool NeedsSql { get; set; }
        public bool NeedsTools { get; set; }
        public List<string> Tools { get; set; } = new List<string>();
        public string Reasoning { get; set; } = string.Empty;
        public ExtractedEntities? ExtractedEntities { get; set; }
    }

    public class ExtractedEntities
    {
        public string? AssetName { get; set; }
        public string? AssetId { get; set; }
        public string? DepartmentName { get; set; }
    }
}
