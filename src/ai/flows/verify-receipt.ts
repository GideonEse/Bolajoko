'use server';

/**
 * @fileOverview Verifies receipt authenticity based on receipt ID and date.
 *
 * - verifyReceipt - A function that handles the receipt verification process.
 * - VerifyReceiptInput - The input type for the verifyReceipt function.
 * - VerifyReceiptOutput - The return type for the verifyReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyReceiptInputSchema = z.object({
  receiptImage: z
    .string()
    .describe(
      "A photo of the receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  receiptId: z.string().describe('The ID of the receipt.'),
  date: z.string().describe('The date on the receipt.'),
});
export type VerifyReceiptInput = z.infer<typeof VerifyReceiptInputSchema>;

const VerifyReceiptOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the receipt is valid or not.'),
  reason: z.string().describe('The reason for the receipt being invalid, if applicable.'),
});
export type VerifyReceiptOutput = z.infer<typeof VerifyReceiptOutputSchema>;

export async function verifyReceipt(input: VerifyReceiptInput): Promise<VerifyReceiptOutput> {
  return verifyReceiptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyReceiptPrompt',
  input: {schema: VerifyReceiptInputSchema},
  output: {schema: VerifyReceiptOutputSchema},
  prompt: `You are an expert receipt verifier. You will check the receipt to ensure that it is valid.

You will use this information to verify the receipt, and set the isValid output field appropriately.
If the receipt is not valid, you will provide a reason in the reason output field.

Pay close attention to the receipt ID, date, any stamps, and signatures present in the image to determine its authenticity. The user-provided information should be cross-referenced with the image.

Receipt Image: {{media url=receiptImage}}
Receipt ID: {{{receiptId}}}
Date: {{{date}}}`,
});

const verifyReceiptFlow = ai.defineFlow(
  {
    name: 'verifyReceiptFlow',
    inputSchema: VerifyReceiptInputSchema,
    outputSchema: VerifyReceiptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
