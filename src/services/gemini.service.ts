import { Injectable, signal } from '@angular/core';
import { Observable, from } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private genAI = new GoogleGenerativeAI('API_KEY_GOES_HERE'); // TODO: find a way to hide this
  private model = this.genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-image-preview',
  });

  private readonly PROMPT =
    'Create a raccoon with the face resembling this image {image}. The raccon should have a happy expression, have a cartoon style, and the environment should be somewhere famous in {country}';

  /**
   * Generates an image based on a prompt.
   * Note: Gemini 3 Flash Image (Nano Banana 2) returns a URL or Base64.
   */
  public getImage(country: string, originalImgUrl: string): Observable<string> {
    const prompt = this.PROMPT.replace('{country}', country).replace('{image}', originalImgUrl);
    // We use 'from' to convert the Gemini SDK Promise into an Observable
    return from(this.generateImage(prompt)).pipe(
      map((response) => {
        console.log('Gemini API Response:', response);

        return response;
      }),
    );
  }

  private generateImage(prompt: string): Observable<string> {
    // We wrap the promise in 'from' for RxJS compatibility
    return from(this.model.generateContent(prompt)).pipe(
      map((result) => {
        const response = result.response;

        // Gemini returns images as parts within the candidates
        // We look for an inlineData part with a mimeType of image/png
        const candidate = response.candidates?.[0];
        const imagePart = candidate?.content.parts.find((part) =>
          part.inlineData?.mimeType.includes('image'),
        );

        if (imagePart?.inlineData) {
          return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        }

        throw new Error('No image data found in response');
      }),
      catchError((err) => {
        console.error('Gemini SDK Error:', err);
        throw 'Image generation failed. Ensure your API key has access to Imagen models.';
      }),
    );
  }
}
