#!/usr/bin/env python3
"""Generate a simple client-ready PowerPoint from the WaterApps deck source."""

from __future__ import annotations

import argparse
import datetime as dt
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape


P_NS = "http://schemas.openxmlformats.org/presentationml/2006/main"
A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
CP_NS = "http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
DC_NS = "http://purl.org/dc/elements/1.1/"
DCTERMS_NS = "http://purl.org/dc/terms/"
XSI_NS = "http://www.w3.org/2001/XMLSchema-instance"


def inches(value: float) -> int:
    return int(round(value * 914400))


def parse_deck(markdown_path: Path) -> list[dict[str, list[str] | str]]:
    raw = markdown_path.read_text(encoding="utf-8")
    sections = [section.strip() for section in raw.split("\n---\n") if section.strip()]
    slides: list[dict[str, list[str] | str]] = []
    for section in sections:
        lines = [line.rstrip() for line in section.splitlines()]
        title = ""
        bullets: list[str] = []
        paragraphs: list[str] = []
        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue
            if stripped.startswith("# "):
                title = stripped[2:].strip()
                continue
            if stripped.startswith("- "):
                bullets.append(stripped[2:].strip())
                continue
            if stripped.startswith("Audience:") or stripped.startswith("Status:") or stripped.startswith("Last updated:"):
                continue
            paragraphs.append(stripped)
        if title and (paragraphs or bullets):
            slides.append({"title": title, "paragraphs": paragraphs, "bullets": bullets})
    return slides


def solid_fill(color: str) -> str:
    return f"<a:solidFill><a:srgbClr val=\"{color}\"/></a:solidFill>"


def line_style(color: str, width: int = 0) -> str:
    if width <= 0:
        return "<a:ln><a:noFill/></a:ln>"
    return f"<a:ln w=\"{width}\">{solid_fill(color)}</a:ln>"


def text_run(text: str, size: int, color: str, bold: bool = False, font: str = "Aptos") -> str:
    bold_attr = ' b="1"' if bold else ""
    return (
        f"<a:r>"
        f"<a:rPr lang=\"en-AU\" sz=\"{size}\"{bold_attr} dirty=\"0\" smtClean=\"0\">"
        f"{solid_fill(color)}"
        f"<a:latin typeface=\"{escape(font)}\"/>"
        f"</a:rPr>"
        f"<a:t>{escape(text)}</a:t>"
        f"</a:r>"
    )


def paragraph_xml(
    text: str,
    size: int,
    color: str,
    *,
    level: int = 0,
    bullet: bool = False,
    bold: bool = False,
    font: str = "Aptos",
) -> str:
    bullet_xml = f"<a:buChar char=\"&#8226;\"/>" if bullet else "<a:buNone/>"
    level_attr = f' lvl="{level}"' if level else ""
    return (
        f"<a:p>"
        f"<a:pPr marL=\"{342900 if bullet else 0}\" indent=\"{-171450 if bullet else 0}\"{level_attr}>"
        f"{bullet_xml}"
        f"</a:pPr>"
        f"{text_run(text, size, color, bold=bold, font=font)}"
        f"<a:endParaRPr lang=\"en-AU\" sz=\"{size}\" dirty=\"0\"/>"
        f"</a:p>"
    )


def textbox_xml(
    shape_id: int,
    name: str,
    x: int,
    y: int,
    cx: int,
    cy: int,
    paragraphs: list[str],
    *,
    size: int,
    color: str,
    bold_first: bool = False,
    bullet: bool = False,
    font: str = "Aptos",
    fill: str | None = None,
    no_fill: bool = True,
) -> str:
    fill_xml = "<a:noFill/>" if no_fill and fill is None else solid_fill(fill or "FFFFFF")
    paras = []
    for index, paragraph in enumerate(paragraphs):
        paras.append(
            paragraph_xml(
                paragraph,
                size,
                color,
                bullet=bullet,
                bold=bold_first and index == 0,
                font=font,
            )
        )
    tx_body = "".join(paras) or paragraph_xml("", size, color, font=font)
    return (
        f"<p:sp>"
        f"<p:nvSpPr>"
        f"<p:cNvPr id=\"{shape_id}\" name=\"{escape(name)}\"/>"
        f"<p:cNvSpPr txBox=\"1\"/>"
        f"<p:nvPr/>"
        f"</p:nvSpPr>"
        f"<p:spPr>"
        f"<a:xfrm><a:off x=\"{x}\" y=\"{y}\"/><a:ext cx=\"{cx}\" cy=\"{cy}\"/></a:xfrm>"
        f"<a:prstGeom prst=\"rect\"><a:avLst/></a:prstGeom>"
        f"{fill_xml}"
        f"{line_style('FFFFFF', 0)}"
        f"</p:spPr>"
        f"<p:txBody>"
        f"<a:bodyPr wrap=\"square\" lIns=\"45720\" tIns=\"45720\" rIns=\"45720\" bIns=\"45720\" anchor=\"ctr\"/>"
        f"<a:lstStyle/>"
        f"{tx_body}"
        f"</p:txBody>"
        f"</p:sp>"
    )


def rectangle_xml(shape_id: int, name: str, x: int, y: int, cx: int, cy: int, fill: str) -> str:
    return (
        f"<p:sp>"
        f"<p:nvSpPr>"
        f"<p:cNvPr id=\"{shape_id}\" name=\"{escape(name)}\"/>"
        f"<p:cNvSpPr/>"
        f"<p:nvPr/>"
        f"</p:nvSpPr>"
        f"<p:spPr>"
        f"<a:xfrm><a:off x=\"{x}\" y=\"{y}\"/><a:ext cx=\"{cx}\" cy=\"{cy}\"/></a:xfrm>"
        f"<a:prstGeom prst=\"rect\"><a:avLst/></a:prstGeom>"
        f"{solid_fill(fill)}"
        f"{line_style(fill, 0)}"
        f"</p:spPr>"
        f"</p:sp>"
    )


def make_slide_xml(slide_index: int, title: str, paragraphs: list[str], bullets: list[str]) -> str:
    slide_width = inches(13.333)
    slide_height = inches(7.5)
    shapes = [
        rectangle_xml(2, f"Top Bar {slide_index}", 0, 0, slide_width, inches(0.55), "0B2E59"),
        rectangle_xml(3, f"Accent Bar {slide_index}", inches(0.68), inches(1.56), inches(1.15), inches(0.08), "2AA7C9"),
        textbox_xml(
            4,
            f"Title {slide_index}",
            inches(0.68),
            inches(0.75),
            inches(11.8),
            inches(0.8),
            [title],
            size=2400,
            color="0B2E59",
            bold_first=True,
            font="Aptos Display",
            no_fill=True,
        ),
    ]
    body_paragraphs = paragraphs.copy()
    if bullets:
        body_paragraphs.extend(bullets)
    body_plain = paragraphs[:1]
    bullet_only = bullets if bullets else body_paragraphs[1:]

    if body_plain:
        shapes.append(
            textbox_xml(
                5,
                f"Lead {slide_index}",
                inches(0.68),
                inches(1.82),
                inches(11.8),
                inches(0.75),
                body_plain,
                size=1160,
                color="32526B",
                font="Aptos",
                no_fill=True,
            )
        )

    if bullet_only:
        shapes.append(
            textbox_xml(
                6,
                f"Body {slide_index}",
                inches(0.92),
                inches(2.45),
                inches(11.4),
                inches(3.9),
                bullet_only,
                size=1040,
                color="16324F",
                bullet=True,
                font="Aptos",
                no_fill=True,
            )
        )

    footer_text = f"WaterApps | Architecture Showcase | {slide_index}"
    shapes.append(
        textbox_xml(
            7,
            f"Footer {slide_index}",
            inches(0.68),
            inches(6.9),
            inches(12.0),
            inches(0.32),
            [footer_text],
            size=700,
            color="5C7287",
            font="Aptos",
            no_fill=True,
        )
    )

    sp_tree = (
        "<p:nvGrpSpPr>"
        "<p:cNvPr id=\"1\" name=\"\"/>"
        "<p:cNvGrpSpPr/>"
        "<p:nvPr/>"
        "</p:nvGrpSpPr>"
        "<p:grpSpPr>"
        "<a:xfrm><a:off x=\"0\" y=\"0\"/><a:ext cx=\"0\" cy=\"0\"/><a:chOff x=\"0\" y=\"0\"/><a:chExt cx=\"0\" cy=\"0\"/></a:xfrm>"
        "</p:grpSpPr>"
        + "".join(shapes)
    )
    return (
        f"<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
        f"<p:sld xmlns:a=\"{A_NS}\" xmlns:r=\"{R_NS}\" xmlns:p=\"{P_NS}\">"
        f"<p:cSld><p:spTree>{sp_tree}</p:spTree></p:cSld>"
        f"<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>"
        f"</p:sld>"
    )


def slide_relationship_xml() -> str:
    return (
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
        "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
        "<Relationship Id=\"rId1\" "
        "Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout\" "
        "Target=\"../slideLayouts/slideLayout1.xml\"/>"
        "</Relationships>"
    )


def presentation_xml(slides: list[dict[str, list[str] | str]]) -> str:
    sld_ids = []
    for index in range(1, len(slides) + 1):
        sld_ids.append(f"<p:sldId id=\"{255 + index}\" r:id=\"rId{index + 1}\"/>")
    return (
        f"<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
        f"<p:presentation xmlns:a=\"{A_NS}\" xmlns:r=\"{R_NS}\" xmlns:p=\"{P_NS}\" saveSubsetFonts=\"1\">"
        f"<p:sldMasterIdLst><p:sldMasterId id=\"2147483648\" r:id=\"rId1\"/></p:sldMasterIdLst>"
        f"<p:sldIdLst>{''.join(sld_ids)}</p:sldIdLst>"
        f"<p:sldSz cx=\"{inches(13.333)}\" cy=\"{inches(7.5)}\"/>"
        f"<p:notesSz cx=\"6858000\" cy=\"9144000\"/>"
        f"<p:defaultTextStyle>"
        f"<a:defPPr/>"
        f"<a:lvl1pPr marL=\"0\" indent=\"0\"/>"
        f"<a:lvl2pPr marL=\"457200\" indent=\"0\"/>"
        f"<a:lvl3pPr marL=\"914400\" indent=\"0\"/>"
        f"</p:defaultTextStyle>"
        f"</p:presentation>"
    )


def presentation_relationships_xml(slide_count: int) -> str:
    relationships = [
        "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster\" "
        "Target=\"slideMasters/slideMaster1.xml\"/>"
    ]
    for index in range(1, slide_count + 1):
        relationships.append(
            f"<Relationship Id=\"rId{index + 1}\" "
            f"Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide\" "
            f"Target=\"slides/slide{index}.xml\"/>"
        )
    return (
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
        "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
        + "".join(relationships)
        + "</Relationships>"
    )


def slide_master_xml() -> str:
    return (
        f"<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
        f"<p:sldMaster xmlns:a=\"{A_NS}\" xmlns:r=\"{R_NS}\" xmlns:p=\"{P_NS}\">"
        f"<p:cSld name=\"WaterApps Theme\">"
        f"<p:bg><p:bgPr>{solid_fill('FFFFFF')}<a:effectLst/></p:bgPr></p:bg>"
        f"<p:spTree>"
        f"<p:nvGrpSpPr><p:cNvPr id=\"1\" name=\"\"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>"
        f"<p:grpSpPr><a:xfrm><a:off x=\"0\" y=\"0\"/><a:ext cx=\"0\" cy=\"0\"/><a:chOff x=\"0\" y=\"0\"/><a:chExt cx=\"0\" cy=\"0\"/></a:xfrm></p:grpSpPr>"
        f"</p:spTree>"
        f"</p:cSld>"
        f"<p:clrMap bg1=\"lt1\" tx1=\"dk1\" bg2=\"lt2\" tx2=\"dk2\" accent1=\"accent1\" accent2=\"accent2\" accent3=\"accent3\" accent4=\"accent4\" accent5=\"accent5\" accent6=\"accent6\" hlink=\"hlink\" folHlink=\"folHlink\"/>"
        f"<p:sldLayoutIdLst><p:sldLayoutId id=\"1\" r:id=\"rId1\"/></p:sldLayoutIdLst>"
        f"<p:txStyles>"
        f"<p:titleStyle><a:lvl1pPr algn=\"l\"/><a:defRPr sz=\"2400\" b=\"1\"/></p:titleStyle>"
        f"<p:bodyStyle><a:lvl1pPr marL=\"342900\" indent=\"-171450\"/><a:defRPr sz=\"1100\"/></p:bodyStyle>"
        f"<p:otherStyle><a:defPPr/></p:otherStyle>"
        f"</p:txStyles>"
        f"</p:sldMaster>"
    )


def slide_master_relationships_xml() -> str:
    return (
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
        "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
        "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout\" "
        "Target=\"../slideLayouts/slideLayout1.xml\"/>"
        "<Relationship Id=\"rId2\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme\" "
        "Target=\"../theme/theme1.xml\"/>"
        "</Relationships>"
    )


def slide_layout_xml() -> str:
    return (
        f"<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
        f"<p:sldLayout xmlns:a=\"{A_NS}\" xmlns:r=\"{R_NS}\" xmlns:p=\"{P_NS}\" type=\"blank\" preserve=\"1\">"
        f"<p:cSld name=\"Blank\">"
        f"<p:spTree>"
        f"<p:nvGrpSpPr><p:cNvPr id=\"1\" name=\"\"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>"
        f"<p:grpSpPr><a:xfrm><a:off x=\"0\" y=\"0\"/><a:ext cx=\"0\" cy=\"0\"/><a:chOff x=\"0\" y=\"0\"/><a:chExt cx=\"0\" cy=\"0\"/></a:xfrm></p:grpSpPr>"
        f"</p:spTree>"
        f"</p:cSld>"
        f"<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>"
        f"</p:sldLayout>"
    )


def slide_layout_relationships_xml() -> str:
    return (
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
        "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
        "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster\" "
        "Target=\"../slideMasters/slideMaster1.xml\"/>"
        "</Relationships>"
    )


def theme_xml() -> str:
    return (
        f"<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
        f"<a:theme xmlns:a=\"{A_NS}\" name=\"WaterApps Theme\">"
        f"<a:themeElements>"
        f"<a:clrScheme name=\"WaterApps\">"
        f"<a:dk1><a:srgbClr val=\"0B2E59\"/></a:dk1>"
        f"<a:lt1><a:srgbClr val=\"FFFFFF\"/></a:lt1>"
        f"<a:dk2><a:srgbClr val=\"16324F\"/></a:dk2>"
        f"<a:lt2><a:srgbClr val=\"F5F8FB\"/></a:lt2>"
        f"<a:accent1><a:srgbClr val=\"2AA7C9\"/></a:accent1>"
        f"<a:accent2><a:srgbClr val=\"20C997\"/></a:accent2>"
        f"<a:accent3><a:srgbClr val=\"86BBD8\"/></a:accent3>"
        f"<a:accent4><a:srgbClr val=\"F3A712\"/></a:accent4>"
        f"<a:accent5><a:srgbClr val=\"D62828\"/></a:accent5>"
        f"<a:accent6><a:srgbClr val=\"5C7287\"/></a:accent6>"
        f"<a:hlink><a:srgbClr val=\"0563C1\"/></a:hlink>"
        f"<a:folHlink><a:srgbClr val=\"954F72\"/></a:folHlink>"
        f"</a:clrScheme>"
        f"<a:fontScheme name=\"WaterApps Fonts\">"
        f"<a:majorFont><a:latin typeface=\"Aptos Display\"/><a:ea typeface=\"\"/><a:cs typeface=\"\"/></a:majorFont>"
        f"<a:minorFont><a:latin typeface=\"Aptos\"/><a:ea typeface=\"\"/><a:cs typeface=\"\"/></a:minorFont>"
        f"</a:fontScheme>"
        f"<a:fmtScheme name=\"WaterApps Format\">"
        f"<a:fillStyleLst>"
        f"<a:solidFill><a:schemeClr val=\"lt1\"/></a:solidFill>"
        f"<a:solidFill><a:schemeClr val=\"accent1\"/></a:solidFill>"
        f"<a:solidFill><a:schemeClr val=\"accent2\"/></a:solidFill>"
        f"</a:fillStyleLst>"
        f"<a:lnStyleLst>"
        f"<a:ln w=\"9525\"><a:solidFill><a:schemeClr val=\"accent1\"/></a:solidFill><a:prstDash val=\"solid\"/></a:ln>"
        f"<a:ln w=\"25400\"><a:solidFill><a:schemeClr val=\"accent1\"/></a:solidFill><a:prstDash val=\"solid\"/></a:ln>"
        f"<a:ln w=\"38100\"><a:solidFill><a:schemeClr val=\"accent1\"/></a:solidFill><a:prstDash val=\"solid\"/></a:ln>"
        f"</a:lnStyleLst>"
        f"<a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>"
        f"<a:bgFillStyleLst>"
        f"<a:solidFill><a:schemeClr val=\"lt1\"/></a:solidFill>"
        f"<a:solidFill><a:schemeClr val=\"lt2\"/></a:solidFill>"
        f"<a:solidFill><a:schemeClr val=\"dk1\"/></a:solidFill>"
        f"</a:bgFillStyleLst>"
        f"</a:fmtScheme>"
        f"</a:themeElements>"
        f"<a:objectDefaults/><a:extraClrSchemeLst/>"
        f"</a:theme>"
    )


def content_types_xml(slide_count: int) -> str:
    overrides = [
        "<Override PartName=\"/ppt/presentation.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml\"/>",
        "<Override PartName=\"/ppt/slideMasters/slideMaster1.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml\"/>",
        "<Override PartName=\"/ppt/slideLayouts/slideLayout1.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml\"/>",
        "<Override PartName=\"/ppt/theme/theme1.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.theme+xml\"/>",
        "<Override PartName=\"/docProps/core.xml\" ContentType=\"application/vnd.openxmlformats-package.core-properties+xml\"/>",
        "<Override PartName=\"/docProps/app.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.extended-properties+xml\"/>",
    ]
    for index in range(1, slide_count + 1):
        overrides.append(
            f"<Override PartName=\"/ppt/slides/slide{index}.xml\" "
            f"ContentType=\"application/vnd.openxmlformats-officedocument.presentationml.slide+xml\"/>"
        )
    return (
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
        "<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">"
        "<Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>"
        "<Default Extension=\"xml\" ContentType=\"application/xml\"/>"
        + "".join(overrides)
        + "</Types>"
    )


def root_relationships_xml() -> str:
    return (
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
        "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
        "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"ppt/presentation.xml\"/>"
        "<Relationship Id=\"rId2\" Type=\"http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties\" Target=\"docProps/core.xml\"/>"
        "<Relationship Id=\"rId3\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties\" Target=\"docProps/app.xml\"/>"
        "</Relationships>"
    )


def app_xml(slide_titles: list[str]) -> str:
    heading_pairs = (
        "<vt:vector size=\"2\" baseType=\"variant\">"
        "<vt:variant><vt:lpstr>Slides</vt:lpstr></vt:variant>"
        f"<vt:variant><vt:i4>{len(slide_titles)}</vt:i4></vt:variant>"
        "</vt:vector>"
    )
    titles = "".join(f"<vt:lpstr>{escape(title)}</vt:lpstr>" for title in slide_titles)
    return (
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
        "<Properties xmlns=\"http://schemas.openxmlformats.org/officeDocument/2006/extended-properties\" "
        "xmlns:vt=\"http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes\">"
        "<Application>Microsoft Office PowerPoint</Application>"
        "<PresentationFormat>Widescreen</PresentationFormat>"
        "<Slides>{}</Slides>"
        "<Notes>0</Notes>"
        "<HiddenSlides>0</HiddenSlides>"
        "<MMClips>0</MMClips>"
        "<ScaleCrop>false</ScaleCrop>"
        "<HeadingPairs>{}</HeadingPairs>"
        "<TitlesOfParts><vt:vector size=\"{}\" baseType=\"lpstr\">{}</vt:vector></TitlesOfParts>"
        "<Company>WaterApps</Company>"
        "<LinksUpToDate>false</LinksUpToDate>"
        "<SharedDoc>false</SharedDoc>"
        "<HyperlinksChanged>false</HyperlinksChanged>"
        "<AppVersion>16.0000</AppVersion>"
        "</Properties>"
    ).format(len(slide_titles), heading_pairs, len(slide_titles), titles)


def core_xml() -> str:
    now = dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    return (
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
        f"<cp:coreProperties xmlns:cp=\"{CP_NS}\" xmlns:dc=\"{DC_NS}\" xmlns:dcterms=\"{DCTERMS_NS}\" "
        f"xmlns:dcmitype=\"http://purl.org/dc/dcmitype/\" xmlns:xsi=\"{XSI_NS}\">"
        "<dc:title>WaterApps Architecture Showcase</dc:title>"
        "<dc:subject>Client-ready architecture showcase</dc:subject>"
        "<dc:creator>Codex for WaterApps</dc:creator>"
        "<cp:keywords>WaterApps, architecture, showcase, client</cp:keywords>"
        "<dc:description>Client-ready overview of WaterApps reference architecture and delivery approach.</dc:description>"
        "<cp:lastModifiedBy>Codex for WaterApps</cp:lastModifiedBy>"
        f"<dcterms:created xsi:type=\"dcterms:W3CDTF\">{now}</dcterms:created>"
        f"<dcterms:modified xsi:type=\"dcterms:W3CDTF\">{now}</dcterms:modified>"
        "</cp:coreProperties>"
    )


def write_pptx(output_path: Path, slides: list[dict[str, list[str] | str]]) -> None:
    slide_titles = [str(slide["title"]) for slide in slides]
    with zipfile.ZipFile(output_path, "w", compression=zipfile.ZIP_DEFLATED) as pptx:
        pptx.writestr("[Content_Types].xml", content_types_xml(len(slides)))
        pptx.writestr("_rels/.rels", root_relationships_xml())
        pptx.writestr("docProps/app.xml", app_xml(slide_titles))
        pptx.writestr("docProps/core.xml", core_xml())
        pptx.writestr("ppt/presentation.xml", presentation_xml(slides))
        pptx.writestr("ppt/_rels/presentation.xml.rels", presentation_relationships_xml(len(slides)))
        pptx.writestr("ppt/slideMasters/slideMaster1.xml", slide_master_xml())
        pptx.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels", slide_master_relationships_xml())
        pptx.writestr("ppt/slideLayouts/slideLayout1.xml", slide_layout_xml())
        pptx.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels", slide_layout_relationships_xml())
        pptx.writestr("ppt/theme/theme1.xml", theme_xml())
        for index, slide in enumerate(slides, start=1):
            title = str(slide["title"])
            paragraphs = [str(item) for item in slide["paragraphs"]]
            bullets = [str(item) for item in slide["bullets"]]
            pptx.writestr(f"ppt/slides/slide{index}.xml", make_slide_xml(index, title, paragraphs, bullets))
            pptx.writestr(f"ppt/slides/_rels/slide{index}.xml.rels", slide_relationship_xml())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        default="docs/ARCHITECTURE_SHOWCASE_DECK.md",
        help="Markdown slide source.",
    )
    parser.add_argument(
        "--output",
        default="docs/ARCHITECTURE_SHOWCASE_DECK.pptx",
        help="Output PowerPoint path.",
    )
    args = parser.parse_args()

    source_path = Path(args.source)
    output_path = Path(args.output)
    slides = parse_deck(source_path)
    if not slides:
        raise SystemExit(f"No slides found in {source_path}")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    write_pptx(output_path, slides)
    print(f"Wrote {len(slides)} slides to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
