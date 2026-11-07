import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AnchorCard, DataPage, Explainer, RowSection, StartHere } from "./index";

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

test("DataPage renders the hero, the body and the cross-links", () => {
  const out = html(
    <DataPage
      kicker="Mileposts"
      title="I-80 rest areas"
      intro="Counts are the guide's figures."
      current="/rest-areas"
    >
      <p>body</p>
    </DataPage>,
  );

  assert.match(out, /<main>/);
  assert.match(out, /class="kicker text-amber-dark">Mileposts</);
  assert.match(out, /I-80 rest areas/);
  assert.match(out, /max-w-2xl text-base/);
  assert.match(out, /<p>body<\/p>/);
  assert.match(out, /aria-current="page"/);
  assert.match(out, /href="\/exits"/);
});

test("DataPage widens the intro and renders actions when asked", () => {
  const out = html(
    <DataPage
      kicker="Work zones"
      title="Tracker"
      intro="intro"
      introWidth="3xl"
      actions={<a href="/x">Open</a>}
    >
      <p>body</p>
    </DataPage>,
  );

  assert.match(out, /max-w-3xl text-base/);
  assert.match(out, /<div class="mt-6 flex flex-wrap items-center gap-3"><a href="\/x">Open<\/a><\/div>/);
  assert.doesNotMatch(out, /More data pages/);
});

test("AnchorCard gives the card a mobile target and a desktop target", () => {
  const out = html(
    <AnchorCard id="sidney-eb">
      <p>truck spaces</p>
    </AnchorCard>,
  );

  assert.match(out, /href="#sidney-eb-m" class="block sm:hidden"/);
  assert.match(out, /href="#sidney-eb" class="hidden sm:block"/);
  assert.equal(out.match(/truck spaces/g)?.length, 2);
});

test("StartHere keeps one heading and one four-column grid", () => {
  const out = html(
    <StartHere title="The biggest lots" note="Capacity figures only.">
      <div>a</div>
      <div>b</div>
    </StartHere>,
  );

  assert.match(out, /Start here/);
  assert.match(out, /The biggest lots/);
  assert.match(out, /Capacity figures only\./);
  assert.match(out, /sm:grid-cols-2 lg:grid-cols-4/);
});

test("Explainer renders one kicker and paragraph per item", () => {
  const out = html(
    <Explainer
      items={[
        { title: "How to use it", body: "Match your direction." },
        { title: "The rules", body: "No camping." },
        { title: "Before you drive", body: "Check 511." },
      ]}
    />,
  );

  assert.equal(out.match(/class="kicker text-amber-dark"/g)?.length, 3);
  assert.match(out, /Match your direction\./);
  assert.match(out, /Check 511\./);
});

type Row = { id: string; name: string; spaces: number };

const rows: Row[] = [
  { id: "a", name: "Alpha", spaces: 12 },
  { id: "b", name: "Beta", spaces: 7 },
];

test("RowSection renders the mobile list and the desktop table from one row set", () => {
  const out = html(
    <RowSection<Row>
      title="West"
      note="MM 0 to 125"
      rows={rows}
      rowKey={(row) => row.id}
      rowId={(row) => row.id}
      columns={[{ label: "Site" }, { label: "Spaces", className: "text-right" }]}
      renderMobile={(row) => <p>{row.name}</p>}
      renderCells={(row) => (
        <>
          <td>{row.name}</td>
          <td className="text-right">{row.spaces}</td>
        </>
      )}
    />,
  );

  assert.match(out, /MM 0 to 125/);
  assert.match(out, /class="mt-3 space-y-3 sm:hidden"/);
  assert.match(out, /id="a-m"/);
  assert.match(out, /class="mt-3 hidden overflow-x-auto border border-line sm:block"/);
  assert.match(out, /<th class="px-3 py-2 font-semibold text-right">Spaces<\/th>/);
  assert.match(out, /<tr id="a" class="scroll-mt-24 bg-paper align-top">/);
  assert.match(out, /<td class="text-right">12<\/td>/);
});

test("RowSection drops the mobile list but keeps the table reachable on phones", () => {
  const out = html(
    <RowSection<Row>
      title="Exits"
      rows={rows}
      rowKey={(row) => row.id}
      columns={[{ label: "Exit" }]}
      tableLabel="West exits table"
      mobileHint="Swipe sideways to see every column →"
      renderCells={(row) => <td>{row.name}</td>}
    />,
  );

  assert.doesNotMatch(out, /<ul/);
  assert.match(out, /role="region" aria-label="West exits table" tabindex="0"/);
  assert.match(out, /class="mt-2 overflow-x-auto border border-line"/);
  assert.match(out, /Swipe sideways/);
});

test("RowSection styles a string note and passes an element note through", () => {
  const plain = html(
    <RowSection<Row>
      title="T"
      note="plain note"
      rows={[]}
      rowKey={(row) => row.id}
      columns={[{ label: "X" }]}
      renderCells={() => <td />}
    />,
  );
  const linked = html(
    <RowSection<Row>
      title="T"
      note={<a href="/exits">All exits →</a>}
      rows={[]}
      rowKey={(row) => row.id}
      columns={[{ label: "X" }]}
      renderCells={() => <td />}
    />,
  );

  assert.match(plain, /<p class="text-\[11px\] font-semibold tracking-wide text-slate uppercase">plain note<\/p>/);
  assert.match(linked, /<a href="\/exits">All exits →<\/a>/);
  assert.doesNotMatch(linked, /tracking-wide text-slate uppercase">All exits/);
});
