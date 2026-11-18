const form = document.querySelector("#search-form");
const field = document.querySelector("#query");
const submit = form.querySelector("button");
const statusMessage = document.querySelector("#status");
const resultsList = document.querySelector("#commune-results");
const slot = document.querySelector("#slot");
const comparison = document.querySelector("#comparison");
const selectedCommunes = { a: null, b: null };

slot.addEventListener("change", updateResultLabels);

function updateResultLabels() {
    for (const button of resultsList.querySelectorAll("button")) {
        button.textContent = `${button.dataset.communeLabel} — Ajouter à Commune ${slot.value.toUpperCase()}`;
    }
}

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
            const button = document.createElement("button");
            button.type = "button";
            button.dataset.communeLabel = `${commune.nom} — ${departmentLabel}`;
            button.addEventListener("click", () => showCommune(commune, departmentLabel));
            item.append(button);
            resultsList.append(item);
        }
        updateResultLabels();
        statusMessage.textContent = communes.length === 0
            ? `Aucune commune trouvée pour « ${search} ».`
            : `Choisis un résultat pour remplir Commune ${slot.value.toUpperCase()}.`;
    } catch {
        statusMessage.textContent = "La recherche a échoué. Réessaie dans un instant.";
    } finally {
        submit.disabled = false;
    }
});

function showCommune(commune, departmentLabel) {
    selectedCommunes[slot.value] = commune;
    const section = document.querySelector(`#commune-${slot.value}`);
    const details = section.querySelector(".commune-details");
    const communeName = section.querySelector(".commune-name");
    const population = section.querySelector(".population");
    const departmentValue = section.querySelector(".department");
    const region = section.querySelector(".region");
    const postalCodes = section.querySelector(".postal-codes");
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
    section.querySelector(".empty-slot").hidden = true;
    statusMessage.textContent = `${commune.nom} ajoutée dans Commune ${slot.value.toUpperCase()}.`;
    comparePopulations();
    communeName.focus();
}

function comparePopulations() {
    const { a, b } = selectedCommunes;
    if (!a || !b) {
        return;
    }
    if (!Number.isFinite(a.population) || !Number.isFinite(b.population)) {
        comparison.textContent = "Comparaison indisponible : une population manque.";
        return;
    }

    const difference = Math.abs(a.population - b.population);
    if (difference === 0) {
        comparison.textContent = `${a.nom} (A) et ${b.nom} (B) ont la même population. Écart : 0 habitant.`;
        return;
    }
    const larger = a.population > b.population ? `${a.nom} (A)` : `${b.nom} (B)`;
    const smaller = a.population > b.population ? `${b.nom} (B)` : `${a.nom} (A)`;
    const unit = difference === 1 ? "habitant" : "habitants";
    comparison.textContent = `${larger} compte ${difference.toLocaleString("fr-FR")} ${unit} de plus que ${smaller}.`;
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
