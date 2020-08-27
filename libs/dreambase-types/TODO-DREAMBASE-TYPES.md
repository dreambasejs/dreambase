# Definiera CollectionSchema typ.

[V] Titta på tidigare arbete i dbtypes paketet!
[V] Döp om DatabaseConfig till DatabaseSchema.
[V] Structure istället för fields?
[V] PrimaryKey?

# Börja titta på typer (se tidigare arbete men kopiera inte direkt eftersom det funkar annorlunda)

[V] Type()
[V] Indexed()
[V] Composite
[V] Update PrimaryKey so that it returns `{[PrimaryKeyType]: theType}` instad of `{[IsPrimaryKey]: true}`
[V] Uppdatera parseType att köra instansieringsfaserna
så att Composite (och de andra) funkar.
[V] Skicka med type-options vid anrop till parseType()
[V] ArrayOf.
[V] Typ: `PrimaryKeyOf<T>` hittar primärnyckelfältet.
[V] Stöd också id = PrimaryKey(String, ()=>this.name, ()=>this.age). Skippa Composite??? Ja!
[V] Implementera runtime-biten i PrimaryKey såsom det är implementerat i Composite och släng Composite.
[V] Bygg klart PrimaryKey() och tolka PrimaryKeyOptions.
[V] Stöd composita field getters i Indexed(). Tolka options.
[V] Dreambase: använd parseType för att bygga upp schemat.
[V] Bygg ett unit test för parseType. Snegla på dxlservers unit test för detta. Och kanske dess kod lite.
[V] Stödja options till Indexed och PrimaryKey? Tror ej behövs nu. Men om, sätt det som överlagrad alternativ funktion.
[ ] Type(Name) ? Case-insensitive string. startsWith(). Not endsWith().
[ ] Type(Text) ? Full-text search.
// EJ ÄN:[ ] Type(FuzzyString) ? String with trigram indexes.

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
