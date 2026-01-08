import StudioPageLayout, { StudioSelect } from "@/components/StudioPageLayout";
import { PORTRAIT_OPTIONS } from "@/data/studioOptions";

const PortraitStudio = () => {
  return (
    <StudioPageLayout
      title="Portrait Studio"
      subtitle="Transform your portrait with AI-powered professional enhancements."
      studioType="Portrait"
    >
      {({ genderMode, selections, handleSelectionChange }) => {
        if (genderMode === "Gentlemen") {
          const options = PORTRAIT_OPTIONS.Gentlemen;
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StudioSelect
                label="Outfit Type"
                options={options.outfitType}
                value={selections.outfitType}
                onChange={(v) => handleSelectionChange("outfitType", v)}
              />
              <StudioSelect
                label="Outfit Color"
                options={options.outfitColor}
                value={selections.outfitColor}
                onChange={(v) => handleSelectionChange("outfitColor", v)}
              />
              <StudioSelect
                label="Shirt Style"
                options={options.shirtStyle}
                value={selections.shirtStyle}
                onChange={(v) => handleSelectionChange("shirtStyle", v)}
              />
              <StudioSelect
                label="Tie / Bow Tie"
                options={options.tieBowTie}
                value={selections.tieBowTie}
                onChange={(v) => handleSelectionChange("tieBowTie", v)}
              />
              <StudioSelect
                label="Grooming"
                options={options.grooming}
                value={selections.grooming}
                onChange={(v) => handleSelectionChange("grooming", v)}
              />
              <StudioSelect
                label="Pose Selection"
                options={options.poseSelection}
                value={selections.poseSelection}
                onChange={(v) => handleSelectionChange("poseSelection", v)}
              />
            </div>
          );
        }

        // Ladies options
        const options = PORTRAIT_OPTIONS.Ladies;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StudioSelect
              label="Outfit Type"
              options={options.outfitType}
              value={selections.outfitType}
              onChange={(v) => handleSelectionChange("outfitType", v)}
            />
            <StudioSelect
              label="Outfit Color"
              options={options.outfitColor}
              value={selections.outfitColor}
              onChange={(v) => handleSelectionChange("outfitColor", v)}
            />
            <StudioSelect
              label="Hair Integration"
              options={options.hairIntegration}
              value={selections.hairIntegration}
              onChange={(v) => handleSelectionChange("hairIntegration", v)}
            />
            <StudioSelect
              label="Jewelry Level"
              options={options.jewelryLevel}
              value={selections.jewelryLevel}
              onChange={(v) => handleSelectionChange("jewelryLevel", v)}
            />
            <StudioSelect
              label="Pose Selection"
              options={options.poseSelection}
              value={selections.poseSelection}
              onChange={(v) => handleSelectionChange("poseSelection", v)}
            />
          </div>
        );
      }}
    </StudioPageLayout>
  );
};

export default PortraitStudio;
