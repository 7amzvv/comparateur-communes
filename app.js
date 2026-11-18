const form = document.querySelector("#search-form");
const field = document.querySelector("#query");
const submit = form.querySelector("button");
const statusMessage = document.querySelector("#status");
const resultsList = document.querySelector("#commune-results");
const details = document.querySelector("#commune-details");
const communeName = document.querySelector("#commune-name");
const population = document.querySelector("#population");
const departmentValue = document.querySelector("#department");
const region = document.querySelector("#region");
const postalCodes = document.querySelector("#postal-codes");

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) {
        return;
    }

    const search = field.value.trim();
    resultsList.replaceChildren();
    details.hidden = true;
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
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = `${commune.nom} — ${departmentLabel}`;
            button.addEventListener("click", () => showCommune(commune, departmentLabel));
            item.append(button);
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

function showCommune(commune, departmentLabel) {
    communeName.textContent = commune.nom;
    population.textContent = Number.isFinite(commune.population)
        ? `${commune.population.toLocaleString("fr-FR")} habitants`
        : "Indisponible";
    departmentValue.textContent = departmentLabel;
    region.textContent = commune.region?.nom ?? "Indisponible";
    postalCodes.textContent = Array.isArray(commune.codesPostaux) && commune.codesPostaux.length > 0
        ? commune.codesPostaux.join(", ")
        : "Indisponible";
    details.hidden = false;
    communeName.focus();
}

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
