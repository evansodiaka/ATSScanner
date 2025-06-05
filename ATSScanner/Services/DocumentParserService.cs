using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace ATSScanner.Services
{
    public class DocumentParserService
    {
        private readonly PdfParserService _pdfParserService;
        private readonly ILogger<DocumentParserService> _logger;

        public DocumentParserService(PdfParserService pdfParserService, ILogger<DocumentParserService> logger)
        {
            _pdfParserService = pdfParserService;
            _logger = logger;
        }

        public async Task<string> ExtractTextFromDocument(Stream fileStream, string contentType)
        {
            try
            {
                switch (contentType.ToLower())
                {
                    case "application/pdf":
                        throw new NotSupportedException("PDF files should be handled by PdfParserService");
                    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                        return ExtractTextFromDocx(fileStream);
                    case "text/plain":
                        return ExtractTextFromTextFile(fileStream);
                    default:
                        throw new NotSupportedException($"Unsupported file type: {contentType}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting text from document");
                throw;
            }
        }

        private async Task<string> ExtractTextFromPdf(Stream stream)
        {
            try
            {
                return await _pdfParserService.ExtractTextFromPdf(stream);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting text from PDF");
                throw new InvalidDataException("Error processing PDF file. The file may be corrupted or password protected.", ex);
            }
        }

        private string ExtractTextFromDocx(Stream fileStream)
        {
            try
            {
                using var document = WordprocessingDocument.Open(fileStream, false);
                var body = document.MainDocumentPart?.Document.Body;
                if (body == null)
                {
                    throw new InvalidOperationException("Document body is empty or corrupted");
                }

                var textBuilder = new StringBuilder();
                var lastParagraphText = string.Empty;

                foreach (var element in body.Elements())
                {
                    if (element is Paragraph paragraph)
                    {
                        var paragraphText = GetParagraphText(paragraph);
                        if (!string.IsNullOrWhiteSpace(paragraphText))
                        {
                            // Avoid duplicate consecutive paragraphs
                            if (paragraphText != lastParagraphText)
                            {
                                // Add extra line break for section headers
                                if (IsSectionHeader(paragraph))
                                {
                                    textBuilder.AppendLine();
                                }
                                textBuilder.AppendLine(paragraphText);
                                lastParagraphText = paragraphText;
                            }
                        }
                    }
                    else if (element is Table table)
                    {
                        textBuilder.AppendLine();
                        textBuilder.AppendLine(GetTableText(table));
                        textBuilder.AppendLine();
                    }
                }

                var extractedText = textBuilder.ToString().Trim();
                if (string.IsNullOrWhiteSpace(extractedText))
                {
                    throw new InvalidOperationException("No text content found in document");
                }

                // Clean up the text
                extractedText = CleanupText(extractedText);

                return extractedText;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting text from DOCX file");
                throw;
            }
        }

        private string CleanupText(string text)
        {
            // Replace multiple spaces with a single space
            text = Regex.Replace(text, @"\s+", " ");

            // Fix spacing around punctuation
            text = Regex.Replace(text, @"\s*([.,;:])\s*", "$1 ");

            // Fix spacing around parentheses
            text = Regex.Replace(text, @"\s*\(\s*", " (");
            text = Regex.Replace(text, @"\s*\)\s*", ") ");

            // Fix spacing around hyphens
            text = Regex.Replace(text, @"\s*-\s*", "-");

            // Fix spacing around slashes
            text = Regex.Replace(text, @"\s*/\s*", "/");

            // Fix spacing around pipes
            text = Regex.Replace(text, @"\s*\|\s*", " | ");

            // Remove multiple consecutive line breaks
            text = Regex.Replace(text, @"\r\n\s*\r\n", "\r\n\r\n");

            return text.Trim();
        }

        private bool IsSectionHeader(Paragraph paragraph)
        {
            // Check if paragraph has heading style
            var style = paragraph.ParagraphProperties?.ParagraphStyleId?.Val;
            if (style != null && style.Value?.StartsWith("Heading") == true)
            {
                return true;
            }

            // Check if paragraph has bold text
            foreach (var run in paragraph.Elements<Run>())
            {
                if (run.RunProperties?.Bold != null)
                {
                    return true;
                }
            }

            // Check if paragraph is short and ends with a colon
            var text = GetParagraphText(paragraph);
            if (text.Length < 50 && text.EndsWith(":"))
            {
                return true;
            }

            return false;
        }

        private string GetParagraphText(Paragraph paragraph)
        {
            var textBuilder = new StringBuilder();
            foreach (var run in paragraph.Elements<Run>())
            {
                var text = run.GetFirstChild<Text>()?.Text;
                if (!string.IsNullOrWhiteSpace(text))
                {
                    textBuilder.Append(text);
                }
            }
            return textBuilder.ToString().Trim();
        }

        private string GetTableText(Table table)
        {
            var textBuilder = new StringBuilder();
            foreach (var row in table.Elements<TableRow>())
            {
                var rowTexts = new List<string>();
                foreach (var cell in row.Elements<TableCell>())
                {
                    var cellText = GetCellText(cell);
                    if (!string.IsNullOrWhiteSpace(cellText))
                    {
                        rowTexts.Add(cellText);
                    }
                }
                if (rowTexts.Any())
                {
                    textBuilder.AppendLine(string.Join(" | ", rowTexts));
                }
            }
            return textBuilder.ToString().Trim();
        }

        private string GetCellText(TableCell cell)
        {
            var textBuilder = new StringBuilder();
            foreach (var paragraph in cell.Elements<Paragraph>())
            {
                var paragraphText = GetParagraphText(paragraph);
                if (!string.IsNullOrWhiteSpace(paragraphText))
                {
                    textBuilder.Append(paragraphText).Append(" ");
                }
            }
            return textBuilder.ToString().Trim();
        }

        private string ExtractTextFromTextFile(Stream fileStream)
        {
            try
            {
                using var reader = new StreamReader(fileStream);
                var content = reader.ReadToEnd();
                if (string.IsNullOrWhiteSpace(content))
                {
                    throw new InvalidOperationException("Text file is empty");
                }
                return content;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting text from text file");
                throw;
            }
        }
    }
} 