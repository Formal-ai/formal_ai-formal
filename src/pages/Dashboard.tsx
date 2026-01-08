import EditorLayout from "@/components/EditorLayout";

const Dashboard = () => {
  return (
    <EditorLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your Formal.AI workspace.</p>
      </div>
    </EditorLayout>
  );
};

export default Dashboard;
