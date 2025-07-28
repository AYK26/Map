namespace InternProject.Wrappers
{
    public class Response<T>
    {
        public T? Data { get; set; }
        public string Message { get; set; }
        public bool Succeeded { get; set; }

        public Response(T data)
        {
            Data = data;
            Message = "İşlem başarılı";
            Succeeded = true;
        }

        public Response(T data, string message, bool succeeded)
        {
            Data = data;
            Message = message;
            Succeeded = succeeded;
        }
    }
}

