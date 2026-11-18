const form = document.querySelector("#search-form");
const field = document.querySelector("#query");
const submit = form.querySelector("button");
const statusMessage = document.querySelector("#status");
const resultsList = document.querySelector("#commune-results");

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) {
        return;
    }

    const search = field.value.trim();
    resultsList.replaceChildren();
    if (!search) {
        statusMessage.textContent = "Saisis un nom ou un code postal.";
        return;
    }

    submit.disabled = true;
    statusMessage.textContent = "Recherche en cours…";
    try {
        const communes = await findCommunes(search);
        for (const commune of communes) {
            const item = document.createElement("li");
            const department = commune.departement;
            const departmentLabel = department?.nom
                ? `${department.nom}${department.code ? ` (${department.code})` : ""}`
                : department?.code ?? "Département indisponible";
            item.textContent = `${commune.nom} — ${departmentLabel}`;
            resultsList.append(item);
        }
        statusMessage.textContent = communes.length === 0
            ? `Aucune commune trouvée pour « ${search} ».`
            : `Recherche « ${search} » · ${communes.length} résultat(s) reçu(s).`;
    } catch {
        statusMessage.textContent = "La recherche a échoué. Réessaie dans un instant.";
    } finally {
        submit.disabled = false;
    }
});

async function findCommunes(search) {
    const url = new URL("https://geo.api.gouv.fr/communes");
    if (/^\d{5}$/.test(search)) {
        url.searchParams.set("codePostal", search);
    } else {
        url.searchParams.set("nom", search);
        url.searchParams.set("boost", "population");
    }
    url.searchParams.set("fields", "nom,code,departement,region,population,codesPostaux");
    url.searchParams.set("limit", "5");

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Le service de recherche est indisponible.");
    }
    const communes = await response.json();
    if (!Array.isArray(communes)) {
        throw new Error("Le service a renvoyé une réponse inattendue.");
    }
    return communes.slice(0, 5);
}
