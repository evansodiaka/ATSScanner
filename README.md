# ATSScanner

**ATSScanner** is a .NET 8.0 web API for analyzing resumes using both traditional ATS (Applicant Tracking System) scoring and AI-powered feedback via OpenAI. It supports PDF, DOCX, and plain text resume uploads, extracts and cleans up the content, and provides detailed analysis and scoring for different industries.

---

## Motivation

I created ATSScanner due to issues with existing ATS scanners. Many available tools either lacked accuracy, were too expensive, or didn't provide the detailed feedback I needed. This project aims to offer a more reliable, customizable, and cost-effective solution for resume analysis.

---

## Features

- **Resume Upload**: Upload resumes in PDF, DOCX, or TXT format via a REST API.
- **Text Extraction**: Extracts and cleans text from uploaded resumes, preserving formatting and technical terms.
- **ATS Scoring**: Scores resumes based on keyword and industry relevance.
- **AI Analysis**: Uses OpenAI (GPT-3.5/4) to provide detailed feedback and an AI-based score.
- **Industry Support**: Allows specifying an industry for more relevant scoring (optional, defaults to "General").
- **Database Storage**: Stores resumes and their analyses in a SQL Server (LocalDB by default).
- **Error Handling**: Robust error handling for file parsing, OpenAI quota issues, and database connectivity.
- **Logging**: Uses built-in logging for troubleshooting and monitoring.

---

## Getting Started

### Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
- SQL Server LocalDB (or another SQL Server instance)
- [OpenAI API Key](https://platform.openai.com/account/api-keys)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ATSScanner.git
   cd ATSScanner
   ```

2. **Restore dependencies:**
   ```bash
   dotnet restore
   ```

3. **Set up your configuration:**
   - Edit `appsettings.json` and set your OpenAI API key and database connection string.

   ```json
   {
     "OpenAI": {
       "ApiKey": "YOUR_OPENAI_API_KEY"
     },
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ATSScannerDb;Trusted_Connection=True;"
     }
   }
   ```

4. **Apply database migrations:**
   ```bash
   dotnet ef database update
   ```

5. **Run the application:**
   ```bash
   dotnet run
   ```

---

## Usage

### Upload a Resume

Send a POST request to `/api/Resume/upload` with a file and optional industry:

```bash
curl -X 'POST' \
  'https://localhost:7291/api/Resume/upload?industry=Tech' \
  -H 'accept: */*' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@YourResume.docx;type=application/vnd.openxmlformats-officedocument.wordprocessingml.document'
```

- Supported file types: PDF, DOCX, TXT
- `industry` parameter is optional (defaults to "General")

### Response

```json
{
  "content": "Extracted and cleaned resume text...",
  "atsScore": 75,
  "aiAnalysis": {
    "score": 80,
    "analysis": "Detailed AI feedback about the resume..."
  }
}
```

---

## Project Structure

- `Controllers/ResumeController.cs` — Handles file uploads and orchestrates analysis.
- `Services/DocumentParserService.cs` — Extracts and cleans text from DOCX and TXT files.
- `Services/PdfParserService.cs` — Extracts text from PDF files.
- `Services/AtsScoringService.cs` — Scores resumes based on industry and keywords.
- `Services/OpenAIService.cs` — Integrates with OpenAI for AI-powered analysis.
- `Models/Resume.cs`, `Models/ResumeAnalysis.cs` — Entity models for database storage.
- `Data/DataContext.cs` — Entity Framework Core database context.

---

## Troubleshooting

- **OpenAI Quota Exceeded**: If you see an error about OpenAI quota, check your [OpenAI billing](https://platform.openai.com/account/billing) or use a different API key.
- **Database Issues**: Ensure SQL Server LocalDB is installed and running, or update the connection string for another SQL Server instance.
- **File Parsing Errors**: Only PDF, DOCX, and TXT files are supported. Ensure files are not corrupted or password-protected.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License



---

## Acknowledgements

- [OpenAI](https://openai.com/)
- [DocumentFormat.OpenXml](https://github.com/OfficeDev/Open-XML-SDK)
- [iText7](https://github.com/itext/itext7) (for PDF parsing)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)

---

## Future Development

This project is actively being developed. Future updates will include additional features, improvements in accuracy, and support for more file formats. Stay tuned for more updates!
