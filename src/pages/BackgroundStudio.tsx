import StudioPageLayout, { StudioSelect } from "@/components/StudioPageLayout";
import { BACKGROUND_OPTIONS } from "@/data/studioOptions";

const BackgroundStudio = () => {
  return (
    <StudioPageLayout
      title="Enhance Your Background"
      subtitle="Transform your portrait with professional studio and corporate backgrounds."
      studioType="Background"
    >
      {({ selections, handleSelectionChange }) => {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StudioSelect
              label="Corporate Background"
              options={BACKGROUND_OPTIONS.corporateBackgrounds}
              value={selections.corporateBackgrounds}
              onChange={(v) => handleSelectionChange("corporateBackgrounds", v)}
            />
            <StudioSelect
              label="Editorial Style"
              options={BACKGROUND_OPTIONS.editorialStyles}
              value={selections.editorialStyles}
              onChange={(v) => handleSelectionChange("editorialStyles", v)}
            />
            <StudioSelect
              label="Outdoor / Environmental"
              options={BACKGROUND_OPTIONS.outdoorEnvironmental}
              value={selections.outdoorEnvironmental}
              onChange={(v) => handleSelectionChange("outdoorEnvironmental", v)}
            />
          </div>
        );
      }}
    </StudioPageLayout>
  );
};

export default BackgroundStudio;
