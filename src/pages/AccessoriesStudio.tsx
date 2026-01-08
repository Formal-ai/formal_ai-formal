import StudioPageLayout, { StudioSelect } from "@/components/StudioPageLayout";
import { ACCESSORIES_OPTIONS } from "@/data/studioOptions";

const AccessoriesStudio = () => {
  return (
    <StudioPageLayout
      title="Enhance Your Accessories"
      subtitle="Add the perfect finishing touches to your professional portrait."
      studioType="Accessories"
    >
      {({ genderMode, selections, handleSelectionChange }) => {
        if (genderMode === "Gentlemen") {
          const options = ACCESSORIES_OPTIONS.Gentlemen;
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StudioSelect
                label="Watch"
                options={options.watches}
                value={selections.watches}
                onChange={(v) => handleSelectionChange("watches", v)}
              />
              <StudioSelect
                label="Glasses"
                options={options.glasses}
                value={selections.glasses}
                onChange={(v) => handleSelectionChange("glasses", v)}
              />
              <StudioSelect
                label="Ties / Bow Ties"
                options={options.tiesBowties}
                value={selections.tiesBowties}
                onChange={(v) => handleSelectionChange("tiesBowties", v)}
              />
              <StudioSelect
                label="Pins / Cufflinks"
                options={options.pinsCufflinks}
                value={selections.pinsCufflinks}
                onChange={(v) => handleSelectionChange("pinsCufflinks", v)}
              />
            </div>
          );
        }

        // Ladies options
        const options = ACCESSORIES_OPTIONS.Ladies;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StudioSelect
              label="Earrings"
              options={options.earrings}
              value={selections.earrings}
              onChange={(v) => handleSelectionChange("earrings", v)}
            />
            <StudioSelect
              label="Necklace"
              options={options.necklaces}
              value={selections.necklaces}
              onChange={(v) => handleSelectionChange("necklaces", v)}
            />
            <StudioSelect
              label="Glasses"
              options={options.glasses}
              value={selections.glasses}
              onChange={(v) => handleSelectionChange("glasses", v)}
            />
            <StudioSelect
              label="Brooch"
              options={options.brooches}
              value={selections.brooches}
              onChange={(v) => handleSelectionChange("brooches", v)}
            />
          </div>
        );
      }}
    </StudioPageLayout>
  );
};

export default AccessoriesStudio;
