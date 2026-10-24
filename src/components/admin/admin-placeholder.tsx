import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export function AdminPlaceholder({
  title,
  note,
}: {
  title: string;
  note: string;
}) {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-forest">{title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Belum tersedia di Part 1</CardTitle>
          <CardDescription>{note}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
