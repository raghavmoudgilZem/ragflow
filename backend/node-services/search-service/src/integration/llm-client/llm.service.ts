import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, Observable } from 'rxjs';
import { SearchPayload } from '../../modules/search-execution/interfaces/search-payload.interface';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) { }

  /*
   * Fetches the list of llm models available from the llm service.
   * This api is used while creating the search configuration.
   */

  async getLlmList() {
    const baseUrl = this.configService.get<string>('LLM_SERVICE_URL');

    if (!baseUrl) {
      this.logger.error('LLM Service config is not defined in the environment');
      throw new HttpException(
        'Internal Server Error: Service configuration is missing',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const url = `${baseUrl}/v1/llm/list`;

      const response = await firstValueFrom(this.httpService.get(url));

      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch user model list from LLM Service: ${error.message}`,
      );

      // If the Identity service returned a specific HTTP error (like 401 or 403),
      // we pass that error through.
      if (error.response) {
        throw new HttpException(
          error.response.data?.message || 'Identity Service error',
          error.response.status,
        );
      }

      throw new HttpException(
        'Llm Service is currently unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Mock method to simulate SSE events for testing.
   * This mimics the LLM service's behavior by sending chunks at intervals.
   */
  /**
   * Mock method to simulate SSE events for testing.
   * This mimics the LLM service's behavior by sending text chunks, 
   * followed by a final payload containing references.
   */
  mockProcessSseNative(payload: any): Observable<any> {
    this.logger.log('Using native RxJS mock SSE streaming for testing');

    return new Observable((subscriber) => {
      // 1. Hardcode the exact sequence of events to guarantee a 1:1 match with your target payload
      const mockEvents = [
        {
          code: 0,
          message: "",
          data: { answer: "### Location of Magadha\n\nMagadha was a region and kingdom in", reference: {}, final: false }
        },
        {
          code: 0,
          message: "",
          data: { answer: " ancient India, based in the eastern Ganges Plain.\n\n#### Geography\nThe territory", reference: {}, final: false }
        },
        {
          code: 0,
          message: "",
          data: { answer: " of the Magadha kingdom proper before its expansion was bounded to the north,", reference: {}, final: false }
        },
        {
          code: 0,
          message: "",
          data: { answer: " west, and east respectively by the Ganga, Son, and Campa rivers", reference: {}, final: false }
        },
        {
          code: 0,
          message: "",
          data: { answer: ", and the eastern spurs of the Vindhya mountains formed its southern border", reference: {}, final: false }
        },
        {
          code: 0,
          message: "",
          data: { answer: ".", reference: {}, final: false }
        },
        {
          code: 0,
          message: "",
          data: {
            answer: "### Location of Magadha\n\nMagadha was a region and kingdom in ancient India, based in the eastern Ganges Plain [ID:0].\n\n#### Geography\nThe territory of the Magadha kingdom proper before its expansion was bounded to the north, west, and east respectively by the Ganga, Son, and Campa rivers, and the eastern spurs of the Vindhya mountains formed its southern border.",
            reference: {
              total: 19,
              chunks: [
                {
                  id: "2a1a62321b5c3653",
                  content: "\nWIKIPEDIA\n25yearsofthefreeediyclop\nMagadha (IPA: [magada:]) was a region and kingdom in\nKingdom of Magadha\nancient India, based in the eastern Ganges Plain. It was one of the sixteen Mahajanapadas during the Second Urbanization\nUnknown (by 1200 BCE)- 625 CE\nperiod. The region was ruled by several dynasties, which overshadowed, conquered, and incorporated the other Mahajanapadas. Magadha played an important role in the development of Jainism and Buddhism2l and formed the core of the Haryankan Empire, Nanda Empire, Mauryan Empire, Shunga Empire and Gupta Empire.\nGeography\nThe territory of the Magadha kingdom proper before its expansion was bounded to the north, west, and east respectively by the Ganga, Son, and Campa rivers, and the\nMagadha (pre-expansion)\neastern spurs of the Vindhya mountains formed its southern\nc. 600 BCE\nborder. The territory of the initial Magadha kingdom thus corresponded to the modern-day Patna and Gaya districts of the Indian state of Bihar.3\nThe region of Greater Magadha also included neighbouring regions in the eastern Gangetic plains, and had a distinct culture and belief.\nHistory\nO Expansion and decline of Magadha-based rule\nVedic period (ca. 1200 BCE-6th cent. BCE)\nbetween 6th and 2nd century BCE O Magadha-based rule under Haryanka\nIn the Atharvaveda (5.22) (ca. 1200-900 BCE) the Magadhas\nand\nare listed along with the Angas, Gandharis and Mujavats as\nShaisunga dynasties O Magadha-based rule under Nanda dynasty\nnon-Vedic tribes located outside of the Kuru-Panchala cultural sphere.[4]15]\nO Magadha-based rule under Maurya dynasty O Magadha-based rule under Shunga\nKikata kingdom\ndynasty O Magadha-based rule under Kanva\nSome scholars have identified the Kikata tribe—-mentioned in\ndynasty\nthe Rigveda (3.53.14) with their ruler Pramaganda—as the forefathers of Magadhas because Kikata is used as synonym\nfor Magadha in the later texts.6l Like the Magadhas in the",
                  document_id: "dfcdb8f27a9311f1ad2039a9c6735fbc",
                  document_name: "Magadha - Wikipedia.pdf",
                  dataset_id: "d68dd5ec7a9311f1ad2039a9c6735fbc",
                  image_id: "d68dd5ec7a9311f1ad2039a9c6735fbc-2a1a62321b5c3653",
                  positions: [[1, 36, 125, 61, 67], [1, 35, 336, 123, 137], [1, 34, 336, 139, 170], [1, 379, 542, 161, 172], [1, 35, 335, 171, 266], [1, 34, 336, 332, 378], [1, 484, 566, 375, 387], [1, 35, 334, 379, 393], [1, 33, 336, 394, 446], [1, 35, 335, 455, 500], [1, 352, 569, 560, 588], [1, 35, 316, 587, 601], [1, 363, 559, 587, 614], [1, 36, 333, 610, 622], [1, 35, 335, 623, 639], [1, 351, 568, 626, 651], [1, 33, 334, 640, 674], [1, 367, 554, 662, 702], [1, 370, 550, 703, 727], [1, 35, 335, 716, 730], [1, 35, 335, 732, 761], [2, 34, 336, 26, 45]],
                  url: null,
                  similarity: 0.4712256389166667,
                  vector_similarity: 0.79297435,
                  term_similarity: 0.3333333341666667,
                  row_id: null,
                  doc_type: "",
                  document_metadata: null
                },
                {
                  id: "61ba63c9b71dae8a",
                  content: "\nSariputra - born to a wealthy Brahmin in a village located near Rajagaha in Magadha. He is considered the first of the Buddha's two chief male disciples, together with Maudgalyayana.[41]\n· Maudgalyayana - born in the village of Kolita in Magadha. He was one of the Buddha's two main disciples. In his youth, he was a spiritual wanderer before meeting the Buddha.42]\n- Mahavira - the 24th Tirthankara of Jainism. Born into a royal kshatriya family in what is now Vaishali district of Bihar. He abandoned all worldly possessions at the age of 30 and became an ascetic. He is considered to be the successor of Parsvanatha and a slightly older contemporary of the Buddha. I43[44]\n· Maitripada - an 11th-century Indian Buddhist Mahasiddha associated with the Mahamudra transmission. Born in the village of Jhatakarani in Magadha. Also associated with the monasteries of Nalanda and Vikramashila.[45]\n· Dhyanabhadra - 13th/14th century monk of Nalanda born to a minor chief in Magadha and later travelled across South and East Asia.[46]\n· Subhuticandra - 11/12th-century Indian Buddhist monk associated with Nalanda and Vikramashila who belonged to Magadha.147]\nSee also\n· Greater Magadha · History of India",
                  document_id: "dfcdb8f27a9311f1ad2039a9c6735fbc",
                  document_name: "Magadha - Wikipedia.pdf",
                  dataset_id: "d68dd5ec7a9311f1ad2039a9c6735fbc",
                  image_id: "d68dd5ec7a9311f1ad2039a9c6735fbc-61ba63c9b71dae8a",
                  positions: [[7, 51, 399, 386, 435], [7, 43, 412, 433, 480], [7, 43, 398, 478, 553], [7, 44, 412, 553, 612], [7, 40, 565, 610, 643], [7, 42, 509, 644, 675], [7, 42, 150, 731, 761]],
                  url: null,
                  similarity: 0.4584238739166667,
                  vector_similarity: 0.7503018,
                  term_similarity: 0.3333333341666667,
                  row_id: null,
                  doc_type: "",
                  document_metadata: null
                },
                {
                  id: "82761b41b510e399",
                  content: "<table><caption> Kingdom of Magadha and other Mahajanapadas during the second</caption>\n<tr><td  >tribe, living on the borders of Brahmanical India, who did not perform Vedic rituals, but Witzel argues that it is \"misplaced\" to locate the Kikatas within Magadha, as in the Rigveda \"their [Kikata] territory is clearly described as being to the south of Kurukshetra, in eastern Rajasthan or western Madhya Pradesh, and Magadha is beyond the geographical horizon of the Rigveda\". ] According to the Puranas, the legendaryll Brihadratha</td></tr>\n<tr><td  >dynasty was the first ruling dynasty of Magadha.</td></tr>\n<tr><td  >Much of the Second Urbanisation took place in Greater Magadha from c.500 BCE onwards, and it was here that Jainism and Buddhism arose.9]</td></tr>\n<tr><td  >There is little certain information available on the early rulers of Magadha. The most important sources are the Buddhist</td></tr>\n<tr><td  >Pali Canon, the Jain Agamas and the Hindu Puranas. The ancient kingdom of Magadha is also mentioned in the</td></tr>\n<tr><td  >dynasty for some 130 years, c. 543 to 413 BCE,10l although</td></tr>\n<tr><td  >Ramayana, the Mahabharata. Based on Jain and Buddhist sources, it appears that Magadha was ruled by the Haryanka dates are uncertain, and could be significantly later.[11]</td></tr>\n<tr><td  >Two notable Haryanka dynasty rulers of Magadha were Bimbisara (also known as Shrenika) and his son Ajatashatru</td></tr>\n<tr><td  >Mahapadma Nanda, the founder of the Nanda Dynasty</td></tr>\n<tr><td  >Jain literature as contemporaries of  the Buddha and</td></tr>\n<tr><td  >(also known as Kunika), who are mentioned in Buddhist and Mahavira. Later, the throne of Magadha was usurped by</td></tr>\n<tr><td  >(c. 345 - c. 322 BCE), which conquered much of north India. The  Nanda dynasty  was overthrown by  Chandragupta Maurya, the founder of the Maurya Empire (c.322-185 BCE).</td></tr>\n</table>",
                  document_id: "dfcdb8f27a9311f1ad2039a9c6735fbc",
                  document_name: "Magadha - Wikipedia.pdf",
                  dataset_id: "d68dd5ec7a9311f1ad2039a9c6735fbc",
                  image_id: "d68dd5ec7a9311f1ad2039a9c6735fbc-82761b41b510e399",
                  positions: [[1, 377, 543, 330, 354], [2, 34, 578, 63, 763]],
                  url: null,
                  similarity: 0.4544724539166667,
                  vector_similarity: 0.7371304,
                  term_similarity: 0.3333333341666667,
                  row_id: null,
                  doc_type: "table",
                  document_metadata: null
                },
                {
                  id: "e643fb0676e42a03",
                  content: "\nThe Magadhan religions are termed the sramana traditions and include Jainism, Buddhism and Ajivika. Buddhism and Jainism were the religions promoted by the early Magadhan kings, such as Srenika, Bimbisara and Ajatashatru, and the Nanda Dynasty (345- 321 BCE) that followed was mostly Jain. These Sramana religions did not worship the Vedic deities, instead of practising some form of asceticism and meditation (jhana) and tending to construct round burial mounds (called stupas in Buddhism).I30l These religions also sought some type of liberation from the cyclic rounds of rebirth and karmic retribution through spiritual knowledge.\nReligious sites in Magadha\nAmong the Buddhist sites currently found in the Magadha region include two UNESCO World Heritage Sites such as the Mahabodhi Temple at Bodh Gayal32l and the Nalanda monastery.[33l The Mahabodhi Temple is one of the most important places of pilgrimage in the Buddhist world and is said to mark the site where the Buddha attained enlightenment. 341\nLanguage\nBeginning in the Theravada commentaries, the Pali language has been identified with Magadhi, the language of the kingdom of Magadha, and this was taken to also be the language that the Buddha used during his life. In the 19th century, the British Orientalist Robert Caesar Childers argued that the true Or geographical name of the Pali language was Magadhi Prakrit, and\nthat because pali means \"line, row, series\", the early Buddhists extended the meaning of the term to mean \"a series of books\", so palibhasa means \"language of the texts\",35l Nonetheless, Pali does retain some eastern features that have been referred to as Magadhisms.136]\nMagadhi Prakrit was one of the three dramatic prakrits to emerge following the decline of Sanskrit. It was spoken in Magadha and neighbouring regions and later evolved into modern eastern Indo- Aryan languages like Magahi, Maithili and Bhojpuri.37\nHistorical figures from Magadha\nImportant people from the region of Magadha include:\n· Mahakasyapa - one of the Buddha's principle disciples born in the 5th century BCE in Mahatittha village in Magadhal38]\n· Indrabhuti Gautama - a Brahmin born to Vasubhuti and in Gorbara village in Magadha. He is considered to be Mahavira's chief disciple, a ganadhara.I39] His brothers, Agnibhuti and Vayubhuti, were also ganadharas of Mahavira. [40l",
                  document_id: "dfcdb8f27a9311f1ad2039a9c6735fbc",
                  document_name: "Magadha - Wikipedia.pdf",
                  dataset_id: "d68dd5ec7a9311f1ad2039a9c6735fbc",
                  image_id: "d68dd5ec7a9311f1ad2039a9c6735fbc-e643fb0676e42a03",
                  positions: [[6, 33, 369, 300, 458], [6, 35, 215, 483, 497], [6, 32, 368, 505, 606], [6, 34, 369, 666, 761], [7, 32, 367, 30, 110], [7, 33, 367, 123, 191], [7, 35, 288, 218, 235], [7, 36, 297, 251, 265], [7, 41, 348, 279, 324], [7, 43, 390, 326, 388]],
                  url: null,
                  similarity: 0.3495626793958333,
                  vector_similarity: 0.77632004,
                  term_similarity: 0.16666666770833335,
                  row_id: null,
                  doc_type: "",
                  document_metadata: null
                },
                {
                  id: "00f74a08ff4b836c",
                  content: "\nLate Medieval\nFrom the 11th century until the late 13th century, a group of Buddhist kings known as the  Pithipatis ruled parts of the Magadha region.  These kings  referred to  themselves  as\nGupta Empire\nMagadhadipati which translates to \"Lords of Magadha\".,[20]\nThe Classical Age centered in Magadha.\nBuddhism and Jainism\nGautama Buddha, the founder of Buddhism, lived much of his life in the kingdom of Magadha. He attained enlightenment in Bodh Gaya, gave his first sermon in Sarnath and the first Buddhist council was held in Rajgriha.[21]\nSeveral Sramanic movements had existed before the 6th century BCE, and these influenced both the astika and nastika traditions of Indian philosophy.[22l The Sramana movement gave rise to diverse range of heterodox beliefs, ranging from accepting or denying the concept of soul, atomism, antinomian ethics, materialism, atheism, agnosticism, fatalism to free will, idealisation of extreme asceticism to that of family life, strict ahimsa (non-violence) and vegetarianism\nto the permissibility of violence and meat-eating.[23l Magadha kingdom was the nerve centre of this revolution.\nJainism was revived and re-established after Mahavira, the last and the 24th Tirthankara, who synthesised and revived the philosophies and promulgations of the ancient Sramanic traditions laid down by the first Jain tirthankara Rishabhanatha millions of years ago.24l Buddha founded Buddhism which received royal patronage in the kingdom.\nAccording to Indologist Johannes Bronkhorst, the culture of Magadha was in fundamental ways different from the Vedic kingdoms of the Indo-Aryans. According to Bronkhorst, the sramana culture arose in \"Greater Magadha,\" which was Indo-Aryan, but not Vedic. In this culture, Kshatriyas were placed higher than Brahmins,\nand it rejected Vedic authority and rituals.26127] He argues for a cultural area termed \"Greater Magadha\", defined as roughly the geographical area in which the Buddha and Mahavira lived and taught.[26] [28]\nWith regard to the Buddha, this area stretched by and large from Sravasti, the capital of Kosala, in the north-west to Rajagrha, the capital of Magadha, in the south-east\" 29l According to Bronkhorst, \"there was indeed a culture of Greater Magadha which remained recognizably distinct from Vedic culture until the time of the grammarian Patanjali (ca. 150 BCE) and beyond\"30l The Buddhologist Alexander Wynne writes that there sanis \"overwhelming amount of evidence\" to suggest that this rival culture to the Vedic Aryans dominated the eastern Gangetic plain during the early Buddhist period. Orthodox Vedic Brahmins were, therefore, a minority in Magadha during this early period.L31]",
                  document_id: "dfcdb8f27a9311f1ad2039a9c6735fbc",
                  document_name: "Magadha - Wikipedia.pdf",
                  dataset_id: "d68dd5ec7a9311f1ad2039a9c6735fbc",
                  image_id: "d68dd5ec7a9311f1ad2039a9c6735fbc-00f74a08ff4b836c",
                  positions: [[5, 35, 341, 269, 317], [5, 33, 326, 317, 336], [5, 355, 547, 325, 339], [5, 34, 213, 364, 381], [5, 34, 367, 398, 464], [5, 35, 368, 473, 587], [5, 35, 570, 588, 604], [5, 35, 578, 618, 681], [5, 35, 577, 693, 741], [6, 34, 370, 27, 93], [6, 33, 369, 109, 288]],
                  url: null,
                  similarity: 0.34286114739583334,
                  vector_similarity: 0.7539816,
                  term_similarity: 0.16666666770833335,
                  row_id: null,
                  doc_type: "",
                  document_metadata: null
                },
                {
                  id: "7ca88a8b3b382954",
                  content: "Empires of Magadha\nMahajanapadas and\n janapadas (c. 500 BCE)\nACHAEMENI\nMPI",
                  document_id: "dfcdb8f27a9311f1ad2039a9c6735fbc",
                  document_name: "Magadha - Wikipedia.pdf",
                  dataset_id: "d68dd5ec7a9311f1ad2039a9c6735fbc",
                  image_id: "d68dd5ec7a9311f1ad2039a9c6735fbc-7ca88a8b3b382954",
                  positions: [[3, 351, 576, 16, 529]],
                  url: null,
                  similarity: 0.34105676739583335,
                  vector_similarity: 0.747967,
                  term_similarity: 0.16666666770833335,
                  row_id: null,
                  doc_type: "image",
                  document_metadata: null
                },
                {
                  id: "731d851ee2dbdcbe",
                  content: "\nEarly territorial expansion under Bimbisara and Ajatashatru.\nExpansion\nShaishunaga dynasty (413 BCE-345 BCE)\nNanda dynasty (c.345 BCE-c.322 BCE)\nMaurya Empire (322 BCE - 185 BCE)\nShunga Empire (185 BCE-73 BCE)\nKanva dynasty (73 BCE-28 BCE)\nNanda Empire\nMagadha's dominance over Northern India.\nExtraneous rule (28 BCE-c.240 CE)\nMitra dynasty (Kosambi) ( 1st cent. BCE - 2nd cent.\nCE)\nKushan Empire and Mahameghavahana dynasty (2nd-3rd cent. CE)\nGuptas\nGupta Empire (c.240-c.579)\nMaurya Empire\nPost-Gupta\nPan-Indianfromexpansion originating Pataliputra.\nLater Guptas (c. 6th century CE-c. 8th century CE)\nThe Later Gupta dynasty, also known as the Later Guptas of Magadha, were the rulers of the Magadha region and partly of Malwa from the 6th and 8th centuries CE. The Later Guptas emerged after the disintegration of the Imperial Guptas as the rulers of Magadha and Malwa however, there is no evidence to connect the two dynasties and the Later Guptas may have adopted the -gupta suffix to link themselves the Imperial Guptas.[16]\nMaukharis (c. 510 CE-c. 606 CE)\nShunga Empire\nThe initial branch of the Maukharis ruled from Gaya in\nPost-Mauryan  dynasty   controlling  central\nMagadha before later moving to Kannauj.17l The Maukharis\nand eastern India.\nhave been associated with the Magadha region since the Mauryan  period. The earliest  inscription of the  Maukhari dynasty has been found in Gaya dating back to the third- century BCE on a clay seal and the Maukharis continued to have a recorded presence in Gaya until the 6th century CE.181\nDue to the events leading to the collapse of the Gupta Empire, Harivarman, the first Maukhari of Kannauj likely migrated westwards to carve out his own kingdom.19]",
                  document_id: "dfcdb8f27a9311f1ad2039a9c6735fbc",
                  document_name: "Magadha - Wikipedia.pdf",
                  dataset_id: "d68dd5ec7a9311f1ad2039a9c6735fbc",
                  image_id: "d68dd5ec7a9311f1ad2039a9c6735fbc-731d851ee2dbdcbe",
                  positions: [[3, 352, 572, 546, 577], [4, 35, 275, 72, 86], [4, 35, 260, 110, 122], [4, 35, 244, 148, 162], [4, 35, 233, 186, 200], [4, 35, 223, 226, 240], [4, 353, 563, 255, 267], [4, 35, 266, 266, 280], [4, 35, 326, 307, 321], [4, 34, 312, 360, 391], [4, 36, 197, 459, 471], [4, 352, 537, 502, 531], [4, 35, 321, 540, 552], [4, 33, 341, 557, 687], [5, 35, 218, 29, 43], [5, 35, 341, 48, 62], [5, 353, 572, 51, 65], [5, 34, 341, 65, 82], [5, 33, 340, 82, 166], [5, 34, 341, 173, 225]],
                  url: null,
                  similarity: 0.33830396739583335,
                  vector_similarity: 0.738791,
                  term_similarity: 0.16666666770833335,
                  row_id: null,
                  doc_type: "",
                  document_metadata: null
                },
                {
                  id: "76cfdbcf2afe956a",
                  content: "masonry in the world\nAmong the oldest pieces of cyclopean\nthe former capital of Magadha, Rajgir.\nCyclopean Wall of Rajgir which encircled\n",
                  document_id: "dfcdb8f27a9311f1ad2039a9c6735fbc",
                  document_name: "Magadha - Wikipedia.pdf",
                  dataset_id: "d68dd5ec7a9311f1ad2039a9c6735fbc",
                  image_id: "d68dd5ec7a9311f1ad2039a9c6735fbc-76cfdbcf2afe956a",
                  positions: [[5, 384, 574, 376, 504]],
                  url: null,
                  similarity: 0.3380749023958334,
                  vector_similarity: 0.73802745,
                  term_similarity: 0.16666666770833335,
                  row_id: null,
                  doc_type: "image",
                  document_metadata: null
                },
                {
                  id: "5528c5dc1f344a71",
                  content: "athur\nGUPTAEMPIRE\nPatalip",
                  document_id: "dfcdb8f27a9311f1ad2039a9c6735fbc",
                  document_name: "Magadha - Wikipedia.pdf",
                  dataset_id: "d68dd5ec7a9311f1ad2039a9c6735fbc",
                  image_id: "d68dd5ec7a9311f1ad2039a9c6735fbc-5528c5dc1f344a71",
                  positions: [[5, 356, 570, 101, 299]],
                  url: null,
                  similarity: 0.33587417739583336,
                  vector_similarity: 0.7306917,
                  term_similarity: 0.16666666770833335,
                  row_id: null,
                  doc_type: "image",
                  document_metadata: null
                },
                {
                  id: "2d318ac9067d32dc",
                  content: "<table><caption> urbanisation</caption>\n<tr><td  >Territorial expansion of Magadha-based rulers 6th century BCE onwards Capital Rajagriha (Girivraj) Later, Pataliputra (modern-day Patna) Common languages  Sanskrit[1] Magadhi Prakrit Ardhamagadhi  Religion Brahmanism</td></tr>\n<tr><td  >Buddhism</td></tr>\n<tr><td  >Prakrit</td></tr>\n<tr><td  >Demonym</td></tr>\n<tr><td  >Magadha-based</td></tr>\n<tr><td  >Jainism Magadhi dynasties and</td></tr>\n<tr><td  >empires</td></tr>\n<tr><td  >·C. 544 - C.413 BCE ·.C. 413 - C.345 BCE</td></tr>\n<tr><td  >Haryanka dynasty Shaishunaga dynasty ·C. 345 - C.321 BCE ·C. 321 - C.185 BCE Maurya Empire</td></tr>\n<tr><td  >·.C. 73 - C.28 BCE</td></tr>\n<tr><td  >Nanda dynasty ·C. 185 - C.73 BCE ·C. 1st cent. BCE</td></tr>\n<tr><td  >Shunga Empire Kanva dynasty</td></tr>\n<tr><td  >Extraneous rule by c.2nd cent. BCE</td></tr>\n<tr><td  >Mitra dynasty (Kosambi) · C. 2nd - c. 3rd CE?</td></tr>\n<tr><td  >Extraneous rule by Mahameghavahana</td></tr>\n<tr><td  >·C. 240 - C.579 CE · C. 6th - Historical era</td></tr>\n<tr><td  >Kushan Empire and dynasty Gupta Empire Later Guptas c. 8th cent. CE</td></tr>\n<tr><td  >Iron Age Currency</td></tr>\n<tr><td  >Preceded</td></tr>\n<tr><td  >Panas Succeeded by by</td></tr>\n<tr><td  >Kikata kingdom</td></tr>\n<tr><td  >(Mahameghavanas)</td></tr>\n<tr><td  >Satavahana Empire</td></tr>\n<tr><td  >Vidarbha kingdom</td></tr>\n<tr><td  >Kalinga</td></tr>\n<tr><td  >Today part of India Nepal</td></tr>\n<tr><td  > Pakistan Bhutan</td></tr>\n</table>",
                  document_id: "dfcdb8f27a9311f1ad2039a9c6735fbc",
                  document_name: "Magadha - Wikipedia.pdf",
                  dataset_id: "d68dd5ec7a9311f1ad2039a9c6735fbc",
                  image_id: "d68dd5ec7a9311f1ad2039a9c6735fbc-2d318ac9067d32dc",
                  positions: [[1, 430, 489, 355, 367], [2, 343, 575, 63, 761]],
                  url: null,
                  similarity: 0.3328967073958333,
                  vector_similarity: 0.7207668,
                  term_similarity: 0.16666666770833335,
                  row_id: null,
                  doc_type: "table",
                  document_metadata: null
                },
                {
                  id: "979ba2a40832e4c8",
                  content: "restoration\nat Bodh Gaya prior to its\nThe ancient Mahabodhi Temple\n",
                  document_id: "dfcdb8f27a9311f1ad2039a9c6735fbc",
                  document_name: "Magadha - Wikipedia.pdf",
                  dataset_id: "d68dd5ec7a9311f1ad2039a9c6735fbc",
                  image_id: "d68dd5ec7a9311f1ad2039a9c6735fbc-979ba2a40832e4c8",
                  positions: [[1, 347, 571, 5657, 6308], [7, 430, 572, 531, 571]],
                  url: null,
                  similarity: 0.33262301739583333,
                  vector_similarity: 0.7198545,
                  term_similarity: 0.16666666770833335,
                  row_id: null,
                  doc_type: "image",
                  document_metadata: null
                },
                {
                  id: "7192d6ddf73461ae",
                  content: "Expansion of Magadha\n(6th-4th centuries BCE)",
                  document_id: "dfcdb8f27a9311f1ad2039a9c6735fbc",
                  document_name: "Magadha - Wikipedia.pdf",
                  dataset_id: "d68dd5ec7a9311f1ad2039a9c6735fbc",
                  image_id: "d68dd5ec7a9311f1ad2039a9c6735fbc-7192d6ddf73461ae",
                  positions: [[3, 355, 570, 357, 523]],
                  url: null,
                  similarity: 0.33176536539583334,
                  vector_similarity: 0.71699566,
                  term_similarity: 0.16666666770833335,
                  row_id: null,
                  doc_type: "image",
                  document_metadata: null
                }
              ],
              doc_aggs: [
                {
                  doc_name: "Magadha - Wikipedia.pdf",
                  doc_id: "dfcdb8f27a9311f1ad2039a9c6735fbc",
                  count: 19
                }
              ]
            },
            final: true
          }
        },
        // Final completion event as requested: data:{"code": 0, "message": "", "data": true}
        {
          code: 0,
          message: "",
          data: true
        }
      ];

      let index = 0;
      let timeoutId: NodeJS.Timeout;

      const sendChunk = () => {
        if (index < mockEvents.length) {
          // Emit the hardcoded object directly. 
          // NestJS @Sse() automatically formats this to `data:{"code":0,...}\n\n`
          subscriber.next({ data: mockEvents[index] });
          index++;
          timeoutId = setTimeout(sendChunk, 200);
        } else {
          subscriber.complete();
        }
      };

      sendChunk();

      return () => {
        clearTimeout(timeoutId);
      };
    });
  }
}
