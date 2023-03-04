import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

const EURIBOR_URL =
  "https://www.suomenpankki.fi/WebForms/ReportViewerPage.aspx?report=/tilastot/markkina-_ja_hallinnolliset_korot/euribor_korot_today_xml_en&output=xml";

const EuriborXml = z.object({
  Report: z.object({
    data: z.object({
      period_Collection: z.object({
        period: z.object({
          matrix1_Title_Collection: z.object({
            rate: z
              .object({
                intr: z.object({
                  value: z.string(),
                }),
                name: z.string(),
              })
              .array(),
          }),
        }),
      }),
    }),
  }),
});

export async function getEuriborRate() {
  const response = await fetch(EURIBOR_URL);
  const rawXml = await response.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });
  const xml = EuriborXml.parse(parser.parse(rawXml));
  const rate =
    xml.Report.data.period_Collection.period.matrix1_Title_Collection.rate
      .map(({ intr, name }) => ({
        value: parseFloat(intr.value),
        name: /(\d+ (?:week|month)).*/.exec(name)![1],
      }))
      .filter(({ name }) => name === "12 month")[0];
  if (rate === undefined) {
    throw new Error("Could not find 12 month rate in XML");
  }
  return rate.value;
}
