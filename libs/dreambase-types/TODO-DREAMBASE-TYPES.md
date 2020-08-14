# Definiera CollectionSchema typ.

[ ] Titta på tidigare arbete.
[ ] Döp om DatabaseConfig till DatabaseSchema.
[ ] Structure istället för fields?
[ ] PrimaryKey?

# Börja titta på typer (se tidigare arbete men kopiera inte direkt eftersom det funkar annorlunda)

[ ] Type()
[ ] Indexed()
[ ] Text() ? Case-insensitive text?
[ ] FullText()

# Enligt dagens beslut: Kör på pretty-mongo style queries!

[ ] Lagra expression i mongoformat (på DBQuery) Se DBExpression.
[ ] Se till att sy ihop Collection.where() med DBStoreExpression och att CollectionSchema och DatabaseSchema är korrekt definierat.
[ ] Restriktiva typningar för Collection.where() baserat på given entitet.

# Skapa en DBStore implementation in-memory

[ ] Skapa funktion som översätter från dreambase DBExpression (mongo expression) till ExpressionNode. Se tidigare skapad algoritm som hanterar matris-skapande av expression.
[ ] Skapa en expression-evaluerare. Se ev tidigare arbete även här.
[ ] Implementera MemDBStore: Count, limit, etc. Stödja Text() typen? Ignorera Index. Den kanske ska ligga i Dreambase och inte i dreambase-types? ja, jag tror det! Två anledningar: 1: Konsumerare av dreambase-types kanske bara definierar modeller. Behöver inte exekvering. 2: Då blir det ändå exception om man helt saknar kontext, istället för att den fallbackar till memdbstore när man anropat utom kontext. Å andra sidan! DÅ KAN MAN INTE BARA SKAPA entiteter och använda dem i fristående komponenter. Men det kan man ändå inte utan incarnation. Eller? Hmmm. Nej kanske bäst att de finns default redan i dreambase-types ändå! Då behövs bara `<Observe fallback={null}><MyComponent/></Observe>`. Vill man sedan koppla in IDB skapar man en Dreambase() och refererar till den i `<Incarnation>` tag:en.
[ ] Skapa unit test i dreambase.

# Övrigt / framtida:

[ ] Kan göras senare: Kopiera och gör om kod för matris-konvertering av ExpressionNode. Som en hjälpfunktion bara. Denna skulle kunna finnas i dblib.
