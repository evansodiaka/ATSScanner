using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;
using System.IO;
using System.Threading.Tasks;

namespace ATSScanner.Services
{
    public class PdfParserService
    {
        public async Task<string> ExtractTextFromPdf(Stream pdfStream)
        {
            try
            {
                // Validate PDF header
                if (!IsValidPdf(pdfStream))
                {
                    throw new InvalidDataException("The uploaded file is not a valid PDF document.");
                }

                using var pdfReader = new PdfReader(pdfStream);
                using var pdfDocument = new PdfDocument(pdfReader);
                var text = new System.Text.StringBuilder();

                for (int i = 1; i <= pdfDocument.GetNumberOfPages(); i++)
                {
                    var page = pdfDocument.GetPage(i);
                    var strategy = new SimpleTextExtractionStrategy();
                    var pageText = PdfTextExtractor.GetTextFromPage(page, strategy);
                    text.Append(pageText);
                }

                if (string.IsNullOrWhiteSpace(text.ToString()))
                {
                    throw new InvalidDataException("The PDF document appears to be empty or contains no extractable text.");
                }

                return text.ToString();
            }
            catch (System.IO.IOException ex)
            {
                throw new InvalidDataException("The PDF file appears to be corrupted or invalid.", ex);
            }
            catch (Exception ex)
            {
                throw new InvalidDataException("An error occurred while processing the PDF file.", ex);
            }
        }

        private bool IsValidPdf(Stream stream)
        {
            try
            {
                // Save the current position
                var originalPosition = stream.Position;
                
                // Read the first 5 bytes to check for PDF header
                var buffer = new byte[5];
                stream.Read(buffer, 0, 5);
                
                // Reset the stream position
                stream.Position = originalPosition;
                
                // Check for PDF header (%PDF-)
                return buffer[0] == 0x25 && // %
                       buffer[1] == 0x50 && // P
                       buffer[2] == 0x44 && // D
                       buffer[3] == 0x46 && // F
                       buffer[4] == 0x2D;   // -
            }
            catch
            {
                return false;
            }
        }
    }
}
