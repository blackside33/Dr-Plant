
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisResultData, Treatment, SuggestedProduct } from '../types';
import { TFunction, i18n as i18nType } from 'i18next'; // Import i18next types

// Helper to generate HTML for a single product table row
const getProductRowHtml = (product: SuggestedProduct, t: TFunction): string => `
    <tr class="bg-white border-b last:border-b-0 border-gray-200">
        <td class="px-4 py-2 font-semibold text-gray-900">${product.name}</td>
        <td class="px-4 py-2 text-gray-700">${product.scientificName}</td>
        <td class="px-4 py-2 text-gray-700">${product.activeIngredient}</td>
    </tr>
`;

// Helper to generate HTML for a single TreatmentCard
const getTreatmentCardHtml = (treatment: Treatment, t: TFunction): string => {
    const isChemical = treatment.type.toLowerCase().includes('chem') || treatment.type.includes('كيميائي');
    const iconHtml = isChemical
        ? `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 me-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 20.25a2.25 2.25 0 104.5 0v-5.642a2.25 2.25 0 00-.659-1.591l-5.432-5.432a2.25 2.25 0 00-1.591-.659H7.5a2.25 2.25 0 00-2.25 2.25v5.642a2.25 2.25 0 00.659 1.591l5.432 5.432a2.25 2.25 0 001.591.659z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25h.01" />
           </svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 me-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 3s4 6 0 9 M18 3s-4 6 0 9 M6 12s4 6 0 9 M18 12s-4 6 0 9 M8 6h8 M8 12h8 M8 18h8" />
           </svg>`;

    const productsTableHtml = treatment.suggestedProducts && treatment.suggestedProducts.length > 0 ? `
        <div>
            <h5 class="font-bold text-sm text-gray-800 mb-2">${t('suggestedProducts')}</h5>
            <div class="overflow-x-auto rounded-lg border border-gray-200">
                <table class="w-full text-sm text-left text-gray-600">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-200">
                        <tr>
                            <th scope="col" class="px-4 py-2 font-bold">${t('commercialName')}</th>
                            <th scope="col" class="px-4 py-2 font-bold">${t('scientificName')}</th>
                            <th scope="col" class="px-4 py-2 font-bold">${t('activeIngredient')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${treatment.suggestedProducts.map(p => getProductRowHtml(p, t)).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    ` : '';

    return `
        <div class="bg-gray-100 p-5 rounded-lg border border-gray-200">
            <div class="flex items-center mb-3">
                ${iconHtml}
                <h4 class="text-lg font-bold text-gray-900">${isChemical ? t('chemicalTreatment') : t('biologicalTreatment')}</h4>
            </div>
            <p class="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">${treatment.description}</p>
            ${productsTableHtml}
        </div>
    `;
};

// Main function to generate PDF
export const generatePdfForAnalysis = async (
    analysis: AnalysisResultData,
    theme: 'light' | 'dark', // Keep theme for potential future use or consistency if other elements depend on it
    t: TFunction,
    i18n: i18nType // Pass i18n to format date
): Promise<void> => {
    // PDF dimensions and margins
    const marginMm = 5; // 0.5 cm margin on all sides
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth(); // A4 width in mm (e.g., 210)
    const pdfHeight = pdf.internal.pageSize.getHeight(); // A4 height in mm (e.g., 297)

    // Calculate content area dimensions for PDF
    const contentPdfWidth = pdfWidth - (2 * marginMm); // Content width available for actual display
    const contentPdfHeight = pdfHeight - (2 * marginMm); // Height available for content on one page

    // Define standard pixel per mm conversion for a nominal DPI (e.g., 96 DPI)
    const PX_PER_MM = 3.779528; // 96 DPI / 25.4 mm/inch

    // Calculate the target CSS pixel width for the tempDiv to match the PDF content width
    // html2canvas will render at this CSS pixel width, then scale:2 will double its resolution
    const htmlRenderWidthPx = contentPdfWidth * PX_PER_MM;

    // Create a temporary element to render content for html2canvas
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px'; // Render off-screen
    tempDiv.style.width = `${htmlRenderWidthPx}px`; // Set width to match contentPdfWidth in pixels
    tempDiv.style.padding = '0'; // No internal padding for tempDiv itself, margins handled by jsPDF
    tempDiv.style.margin = '0'; // Ensure no margin
    tempDiv.style.boxSizing = 'border-box'; // Ensure padding/border doesn't affect width calculation
    
    // Force light theme and black text for PDF
    tempDiv.className = 'light bg-white text-gray-900'; 
    tempDiv.style.backgroundColor = '#ffffff';
    tempDiv.style.color = '#000000';

    tempDiv.dir = i18n.dir(i18n.language); // Apply direction based on language
    document.body.appendChild(tempDiv);

    const severityColorClass = analysis.severityLevel <= 3 ? 'bg-green-600' : analysis.severityLevel <= 7 ? 'bg-yellow-500' : 'bg-red-600';
    const severityWidth = analysis.severityLevel * 10;

    // Populate tempDiv with the HTML content
    // All classes are adjusted for a light theme, black text, and bold headings as requested
    tempDiv.innerHTML = `
        <div class="p-4 bg-white text-gray-900" style="box-sizing: border-box; width: 100%;">
            <h2 class="text-3xl font-bold text-green-700 mb-4 text-center">${analysis.disease}</h2>
            <p class="text-sm text-gray-600 text-center mb-4">
                ${t('analyzedOn')}: ${new Date(analysis.timestamp).toLocaleString(i18n.language)}
            </p>
            <img src="${analysis.imageUrl}" alt="${analysis.disease}" class="w-full h-auto object-cover rounded-lg mb-6 shadow-md" style="max-width: 100%; height: auto;" />

            <div class="space-y-6">
                <div class="bg-gray-100 p-5 rounded-lg border border-gray-200">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h3 class="text-xl font-bold text-gray-900">${t('severityLevel')}</h3>
                        </div>
                        <div class="text-right ${i18n.dir(i18n.language) === 'rtl' ? 'rtl:text-left' : 'text-left'}">
                            <h4 class="text-sm font-bold text-gray-700 mb-1">${t('diseaseClassification')}</h4>
                            <span class="font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full inline-block text-sm">${analysis.diseaseClassification}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-4 mb-2">
                        <div class="w-full bg-gray-200 rounded-full h-4">
                            <div
                                class="h-4 rounded-full transition-all duration-500 ${severityColorClass}"
                                style="width: ${severityWidth}%"
                            ></div>
                        </div>
                        <span class="font-bold text-lg text-gray-800">${analysis.severityLevel}/10</span>
                    </div>
                    <p class="text-gray-700 mt-2">${analysis.severityDescription}</p>
                </div>

                <div class="bg-gray-100 p-5 rounded-lg border border-gray-200">
                    <h3 class="text-xl font-bold text-gray-900 mb-2">${t('description')}</h3>
                    <p class="text-gray-700 whitespace-pre-wrap">${analysis.description}</p>
                </div>
                
                <div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">${t('recommendations')}</h3>
                    <div class="space-y-4">
                        ${analysis.treatments.map(tmt => getTreatmentCardHtml(tmt, t)).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Capture the HTML content as an image
    const canvas = await html2canvas(tempDiv, {
        scale: 2, // Higher scale for better resolution in PDF
        useCORS: true,
        backgroundColor: '#ffffff', // Ensure background is captured as white
        width: htmlRenderWidthPx, // Explicitly set width for html2canvas capture
        height: tempDiv.scrollHeight, // Capture full scroll height to get all content
        onclone: (clonedDoc) => {
            // Apply white background to the cloned document body for accurate capture
            clonedDoc.body.style.backgroundColor = '#ffffff';
        }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.9); // Use JPEG for better file size, 0.9 quality
    
    // Get the actual dimensions of the captured image (at scale: 2)
    const capturedImageWidthPx = canvas.width;
    const capturedImageHeightPx = canvas.height;

    // Calculate the height the image would take in PDF mm if its width matches contentPdfWidth
    const imgHeightInPdfMm = (capturedImageHeightPx / capturedImageWidthPx) * contentPdfWidth;

    let finalDrawWidth = contentPdfWidth;
    let finalDrawHeight = imgHeightInPdfMm;

    // If the image is too tall to fit the page, scale it down
    if (imgHeightInPdfMm > contentPdfHeight) {
        const scaleFactor = contentPdfHeight / imgHeightInPdfMm;
        finalDrawWidth = contentPdfWidth * scaleFactor;
        finalDrawHeight = imgHeightInPdfMm * scaleFactor;
    }

    // Calculate centering positions
    const centerX = (pdfWidth - finalDrawWidth) / 2;
    const centerY = (pdfHeight - finalDrawHeight) / 2;

    pdf.addImage(
        imgData,
        'JPEG', // Using JPEG as per toDataURL
        centerX, // x position on PDF page (mm)
        centerY, // y position on PDF page (mm)
        finalDrawWidth, // width on PDF page (mm)
        finalDrawHeight // height on PDF page (mm)
    );

    // Add watermark
    const watermarkText = 'Plant Doctor AI';
    const watermarkFontSize = 18; // Smaller size
    const watermarkX = marginMm + 5; // Offset from left margin
    const watermarkY = marginMm + 5; // Offset from top margin

    pdf.setFontSize(watermarkFontSize);
    pdf.setTextColor(150); // Light gray for subtle watermark on white background
    pdf.text(watermarkText, watermarkX, watermarkY, {
        align: 'left',
        baseline: 'top', // Align text top to the y-coordinate
        angle: 0, // Horizontal
    });

    pdf.save(`plant-analysis-${analysis.disease.replace(/\s+/g, '-')}-${analysis.id}.pdf`);

    // Clean up the temporary element
    document.body.removeChild(tempDiv);
};
